"use client";

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
     * Export element as PDF
     */
    static async exportPdf(elementId: string, filename: string) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with ID '${elementId}' not found for PDF export`);
            return;
        }

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            
            // A4 dimensions in mm
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if content is longer than one page
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${filename}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
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