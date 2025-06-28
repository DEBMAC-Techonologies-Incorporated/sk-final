"use client";

import jsPDF from 'jspdf';
import { applyLetterheadToContent, needsLetterhead, getLetterheadConfig, generateLetterheadHtml } from './constants';

export class ExportUtils {
    /**
     * Convert HTML to Markdown format
     */
    static htmlToMarkdown(html: string): string {
        let markdown = html;

        // Headers
        markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
        markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
        markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
        markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
        markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
        markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

        // Bold and Italic
        markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
        markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
        markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
        markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

        // Lists
        markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
            return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
        });

        markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
            let counter = 1;
            return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
        });

        // Blockquotes
        markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n');

        // Paragraphs
        markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

        // Line breaks
        markdown = markdown.replace(/<br[^>]*\/?>/gi, '\n');

        // Clean up HTML tags
        markdown = markdown.replace(/<[^>]+>/g, '');

        // Clean up extra whitespace
        markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
        markdown = markdown.trim();

        return markdown;
    }

    /**
     * Export content as Markdown file
     */
    static exportMarkdown(content: string, filename: string) {
        const markdown = this.htmlToMarkdown(content);
        const blob = new Blob([markdown], { type: 'text/markdown' });
        this.downloadFile(blob, `${filename}.md`);
    }

    /**
     * Export content as Word-compatible HTML document
     */
    static exportDocx(content: string, filename: string) {
        const htmlContent = this.createWordCompatibleHtml(content, filename);
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        this.downloadFile(blob, `${filename}.doc`);
    }

    /**
     * Export HTML content directly to PDF using jsPDF's HTML functionality
     * Now with enhanced letterhead support as proper PDF header
     */
    static async exportPdf(elementId: string, filename: string, currentStep?: string) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with ID '${elementId}' not found for PDF export`);
            return;
        }

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Check if this document needs a letterhead
            const shouldAddLetterhead = currentStep && needsLetterhead(currentStep);
            const letterheadConfig = shouldAddLetterhead ? getLetterheadConfig() : null;

            let startY = 15; // Default start position

            // Add letterhead as proper PDF header if needed
            if (shouldAddLetterhead && letterheadConfig) {
                // Create letterhead HTML
                const letterheadHtml = generateLetterheadHtml(letterheadConfig);
                
                // Add letterhead at the very top of the page
                await pdf.html(letterheadHtml, {
                    callback: function() {
                        // Letterhead added successfully
                    },
                    x: 15,
                    y: 10, // Very top of the page
                    width: 180,
                    windowWidth: 650,
                    autoPaging: false, // Don't let letterhead create new pages
                    html2canvas: {
                        allowTaint: true,
                        useCORS: true,
                        scale: 0.3
                    }
                });

                // Adjust start position for main content to be below letterhead
                startY = 50; // Give space for letterhead
            }

            // Get clean content and extract letterhead for PDF header
            let cleanContent = element.innerHTML;
            
            // Remove letterhead from body content since we're adding it as proper PDF header
            // Look for letterhead patterns and remove them from body
            cleanContent = cleanContent.replace(/<div[^>]*letterhead[^>]*>[\s\S]*?<\/div>/gi, '');
            cleanContent = cleanContent.replace(/<table[^>]*>[\s\S]*?Republic of the Philippines[\s\S]*?SANGGUNIANG KABATAAN[\s\S]*?<\/table>/gi, '');
            cleanContent = cleanContent.replace(/<div[^>]*>[\s\S]*?Republic of the Philippines[\s\S]*?SANGGUNIANG KABATAAN[\s\S]*?<\/div>/gi, '');
            
            // Clean up any empty elements or extra spacing that might result
            cleanContent = cleanContent.replace(/<div[^>]*><\/div>/gi, '');
            cleanContent = cleanContent.replace(/<p[^>]*><\/p>/gi, '');
            cleanContent = cleanContent.replace(/^\s*<br[^>]*>\s*/gi, '');
            cleanContent = cleanContent.trim();
            
            // Create a clean HTML version for PDF
            const cleanHtml = this.prepareHtmlForPdf(cleanContent);
            
            // Add main content below the letterhead
            await pdf.html(cleanHtml, {
                callback: function (pdf) {
                    pdf.save(`${filename}.pdf`);
                },
                x: 15,
                y: startY, // Start below letterhead
                width: 180,
                windowWidth: 650,
                margin: [10, 10, 10, 10],
                autoPaging: 'text',
                html2canvas: {
                    allowTaint: true,
                    useCORS: true,
                    scale: 0.25
                }
            });

        } catch (error) {
            console.error('Error generating PDF:', error);
            // Fallback to a simpler text-based PDF
            this.exportSimplePdf(element, filename);
        }
    }

    /**
     * Fallback method for simple text-based PDF export
     */
    private static exportSimplePdf(element: HTMLElement, filename: string) {
        const pdf = new jsPDF();
        const text = element.innerText || element.textContent || '';
        
        // Split text into lines that fit the page width
        const lines = pdf.splitTextToSize(text, 180);
        
        let yPosition = 20;
        const pageHeight = 280;
        const lineHeight = 7;

        lines.forEach((line: string) => {
            if (yPosition > pageHeight) {
                pdf.addPage();
                yPosition = 20;
            }
            pdf.text(line, 15, yPosition);
            yPosition += lineHeight;
        });

        pdf.save(`${filename}.pdf`);
    }

    /**
     * Prepare HTML content for PDF conversion
     */
    private static prepareHtmlForPdf(html: string): string {
        // Clean up problematic attributes and classes
        const cleanHtml = html
            // Remove contenteditable attributes
            .replace(/contenteditable="[^"]*"/gi, '')
            // Remove translate attributes
            .replace(/translate="[^"]*"/gi, '')
            // Remove tabindex attributes
            .replace(/tabindex="[^"]*"/gi, '')
            // Remove TipTap/ProseMirror classes
            .replace(/class="[^"]*tiptap[^"]*"/gi, '')
            .replace(/class="[^"]*ProseMirror[^"]*"/gi, '')
            .replace(/class="[^"]*prose[^"]*"/gi, '')
            // Remove all class attributes (since they're causing issues)
            .replace(/class="[^"]*"/gi, '')
            // Remove empty p tags with just br
            .replace(/<p><br[^>]*><\/p>/gi, '')
            .replace(/<p><br[^>]*class="[^"]*"><\/p>/gi, '')
            // Clean up trailing breaks
            .replace(/class="ProseMirror-trailingBreak"/gi, '')
            // Remove any remaining empty divs
            .replace(/<div[^>]*><\/div>/gi, '')
            // Fix checkbox symbols - replace HTML entities with proper symbols
            .replace(/☑/g, '[X]') // Checked checkbox
            .replace(/☐/g, '[ ]') // Unchecked checkbox
            // Alternative checkbox patterns
            .replace(/&amp;#9745;/g, '[X]') // HTML entity for checked
            .replace(/&amp;#9744;/g, '[ ]') // HTML entity for unchecked
            .replace(/&#9745;/g, '[X]') // Direct HTML entity for checked
            .replace(/&#9744;/g, '[ ]'); // Direct HTML entity for unchecked

        return `
            <div style="
                font-family: 'Times New Roman', serif;
                font-size: 12pt;
                line-height: 1.6;
                color: #000;
                max-width: 100%;
                word-wrap: break-word;
                padding: 20px;
            ">
                <style>
                    h1 { 
                        font-size: 18pt; 
                        font-weight: bold; 
                        margin: 16pt 0 12pt 0; 
                        padding: 0;
                        line-height: 1.3;
                        page-break-after: avoid;
                    }
                    h2 { 
                        font-size: 14pt; 
                        font-weight: bold; 
                        margin: 14pt 0 8pt 0; 
                        padding: 0;
                        line-height: 1.3;
                        page-break-after: avoid;
                    }
                    h3 { 
                        font-size: 12pt; 
                        font-weight: bold; 
                        margin: 12pt 0 6pt 0; 
                        padding: 0;
                        line-height: 1.3;
                        page-break-after: avoid;
                    }
                    p { 
                        margin: 6pt 0; 
                        padding: 0;
                        line-height: 1.6;
                    }
                    table { 
                        border-collapse: collapse; 
                        width: 100%; 
                        margin: 12pt 0; 
                        page-break-inside: auto;
                    }
                    th, td { 
                        border: 1pt solid #000; 
                        padding: 6pt; 
                        text-align: left; 
                        vertical-align: top;
                        page-break-inside: avoid;
                    }
                    th { 
                        background-color: #f0f0f0; 
                        font-weight: bold; 
                    }
                    ul, ol { 
                        margin: 6pt 0; 
                        padding-left: 24pt; 
                    }
                    li { 
                        margin: 3pt 0; 
                        line-height: 1.4;
                    }
                    blockquote { 
                        margin: 12pt 24pt; 
                        padding: 6pt 12pt; 
                        border-left: 3pt solid #ccc; 
                        font-style: italic;
                    }
                </style>
                ${cleanHtml}
            </div>
        `;
    }

    /**
     * Create Word-compatible HTML document
     */
    private static createWordCompatibleHtml(content: string, filename: string): string {
        return `
            <!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word' 
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset="utf-8">
                <title>${filename}</title>
                <style>
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 12pt;
                        line-height: 1.6;
                        margin: 1in;
                        color: #000;
                    }
                    h1, h2, h3, h4, h5, h6 {
                        font-family: 'Times New Roman', Times, serif;
                        margin-top: 20px;
                        margin-bottom: 10px;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 10px 0;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;
    }

    /**
     * Download a file blob
     */
    private static downloadFile(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    static async exportToPDF(content: string, filename: string, currentStep?: string): Promise<void> {
        try {
            // Apply letterhead if needed
            const finalContent = currentStep ? applyLetterheadToContent(content, currentStep) : content;
            
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }

            // HTML template for PDF export
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>${filename}</title>
                    <style>
                        @page {
                            margin: 1in;
                            size: A4;
                        }
                        body {
                            font-family: 'Times New Roman', Times, serif;
                            font-size: 12pt;
                            line-height: 1.6;
                            color: #000;
                            margin: 0;
                            padding: 0;
                            background: white;
                        }
                        .letterhead {
                            page-break-inside: avoid;
                            margin-bottom: 20px;
                        }
                        .letterhead table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        .letterhead img {
                            max-width: 80px;
                            max-height: 80px;
                            object-fit: contain;
                        }
                        .content {
                            margin-top: 20px;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            font-family: 'Times New Roman', Times, serif;
                            margin-top: 20px;
                            margin-bottom: 10px;
                        }
                        p {
                            margin-bottom: 10px;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 10px 0;
                        }
                        th, td {
                            border: 1px solid #000;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #f5f5f5;
                            font-weight: bold;
                        }
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                            .letterhead { page-break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    ${finalContent}
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();

            // Wait for content to load, then print
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            };
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            alert('Failed to export PDF. Please try again.');
        }
    }

    static async exportToWord(content: string, filename: string, currentStep?: string): Promise<void> {
        try {
            // Apply letterhead if needed
            const finalContent = currentStep ? applyLetterheadToContent(content, currentStep) : content;
            
            // Create HTML document for Word export
            const wordContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                      xmlns:w='urn:schemas-microsoft-com:office:word' 
                      xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset="utf-8">
                    <title>${filename}</title>
                    <style>
                        body {
                            font-family: 'Times New Roman', Times, serif;
                            font-size: 12pt;
                            line-height: 1.6;
                            margin: 1in;
                        }
                        .letterhead table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        .letterhead img {
                            max-width: 80px;
                            max-height: 80px;
                            object-fit: contain;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            font-family: 'Times New Roman', Times, serif;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 10px 0;
                        }
                        th, td {
                            border: 1px solid #000;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #f5f5f5;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    ${finalContent}
                </body>
                </html>
            `;

            // Create blob and download
            const blob = new Blob(['\ufeff', wordContent], {
                type: 'application/msword'
            });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting to Word:', error);
            alert('Failed to export Word document. Please try again.');
        }
    }

    static async exportToMarkdown(content: string, filename: string, currentStep?: string): Promise<void> {
        try {
            // For markdown, we'll include letterhead info as text
            let finalContent = content;
            
            if (currentStep) {
                const { needsLetterhead, getLetterheadConfig } = await import('./constants');
                if (needsLetterhead(currentStep)) {
                    const config = getLetterheadConfig();
                    if (config) {
                        const letterheadText = `
# Republic of the Philippines
## ${config.provinceOrCity.toUpperCase()} OF ${config.provinceCityName.toUpperCase()}
### ${config.municipalityOrCity === 'city' ? 'City' : 'Municipality'} of ${config.municipalityCityName}
#### Barangay ${config.barangayName}
## OFFICE OF THE SANGGUNIANG KABATAAN

---

`;
                        finalContent = letterheadText + content;
                    }
                }
            }

            // Convert HTML to basic markdown (simplified)
            const markdownContent = finalContent
                .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
                .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
                .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
                .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
                .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
                .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]*>/g, ''); // Remove remaining HTML tags

            const blob = new Blob([markdownContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename.endsWith('.md') ? filename : `${filename}.md`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting to Markdown:', error);
            alert('Failed to export Markdown file. Please try again.');
        }
    }
}