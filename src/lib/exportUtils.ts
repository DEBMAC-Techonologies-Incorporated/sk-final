"use client";

import jsPDF from 'jspdf';

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
     */
    static async exportPdf(elementId: string, filename: string) {
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

            // Create a clean HTML version for PDF
            const cleanHtml = this.prepareHtmlForPdf(element.innerHTML);
            console.log('Prepared HTML for PDF:', cleanHtml);
            
            // Use jsPDF's html method to convert HTML to PDF
            await pdf.html(cleanHtml, {
                callback: function (pdf) {
                    pdf.save(`${filename}.pdf`);
                },
                x: 15,
                y: 15,
                width: 180, // A4 width minus margins
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
        let cleanHtml = html
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
                        line-height: 1.3;
                        page-break-after: avoid;
                    }
                    h3 { 
                        font-size: 12pt; 
                        font-weight: bold; 
                        margin: 12pt 0 6pt 0; 
                        line-height: 1.3;
                    }
                    p { 
                        margin: 6pt 0; 
                        line-height: 1.4;
                        vertical-align: baseline;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 12pt 0;
                        font-size: 10pt;
                    }
                    th, td {
                        border: 1pt solid #000;
                        padding: 6pt;
                        text-align: left;
                        vertical-align: top;
                    }
                    th {
                        font-weight: bold;
                        background-color: #f0f0f0;
                    }
                    strong {
                        font-weight: bold;
                        vertical-align: baseline;
                        display: inline;
                    }
                    .tableWrapper {
                        margin: 12pt 0;
                        overflow: visible;
                    }
                    div {
                        margin: 0;
                        padding: 0;
                    }
                    /* Fix alignment issues */
                    * {
                        vertical-align: baseline;
                    }
                    /* Ensure consistent baseline alignment */
                    strong, b {
                        vertical-align: baseline;
                        line-height: inherit;
                    }
                </style>
                ${cleanHtml}
            </div>
        `;
    }

    /**
     * Create HTML content that Word can properly import
     */
    private static createWordCompatibleHtml(content: string, filename: string): string {
        return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
    <meta name="ProgId" content="Word.Document">
    <meta name="Generator" content="Microsoft Word 15">
    <meta name="Originator" content="Microsoft Word 15">
    <title>${filename}</title>
    <!--[if gte mso 9]><xml>
    <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotPromptForConvert/>
        <w:DoNotRelyOnCSS/>
        <w:DoNotSaveAsSingleFile/>
    </w:WordDocument>
    </xml><![endif]-->
    <style>
        @page {
            size: 8.5in 11in;
            margin: 1in;
        }
        
        body {
            font-family: "Times New Roman", serif;
            font-size: 12pt;
            line-height: 1.15;
            margin: 0;
            padding: 0;
        }
        
        h1 {
            font-size: 16pt;
            font-weight: bold;
            margin: 12pt 0 6pt 0;
            color: #000;
        }
        
        h2 {
            font-size: 14pt;
            font-weight: bold;
            margin: 12pt 0 6pt 0;
            color: #000;
        }
        
        h3 {
            font-size: 13pt;
            font-weight: bold;
            margin: 12pt 0 6pt 0;
            color: #000;
        }
        
        h4 {
            font-size: 12pt;
            font-weight: bold;
            margin: 12pt 0 6pt 0;
            color: #000;
        }
        
        h5 {
            font-size: 11pt;
            font-weight: bold;
            margin: 12pt 0 6pt 0;
            color: #000;
        }
        
        h6 {
            font-size: 10pt;
            font-weight: bold;
            margin: 12pt 0 6pt 0;
            color: #000;
        }
        
        p {
            margin: 6pt 0;
            text-align: left;
        }
        
        ul, ol {
            margin: 6pt 0;
            padding-left: 36pt;
        }
        
        li {
            margin: 3pt 0;
        }
        
        strong, b {
            font-weight: bold;
        }
        
        em, i {
            font-style: italic;
        }
        
        blockquote {
            margin: 12pt 0;
            padding: 6pt 12pt;
            border-left: 3pt solid #ccc;
            background-color: #f9f9f9;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 12pt 0;
        }
        
        td, th {
            border: 1pt solid #000;
            padding: 6pt;
            text-align: left;
        }
        
        th {
            font-weight: bold;
            background-color: #f0f0f0;
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
    }

    /**
     * Helper method to download a blob as a file
     */
    private static downloadFile(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}