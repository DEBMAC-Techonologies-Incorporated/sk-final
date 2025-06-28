"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { Button } from '@/components/ui/button';
import { DEFAULT_EDITOR_HEADER, needsLetterhead, getLetterheadConfig, generateLetterheadHtml } from '@/lib/constants';
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Quote,
    Redo,
    Undo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Table as TableIcon,
    Plus,
    Minus,
    Columns,
    Rows
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    currentStep?: string;
}

export default function RichTextEditor({ content, onChange, placeholder, currentStep }: RichTextEditorProps) {
    // Determine if this document should show letterhead
    const shouldShowLetterhead = currentStep && needsLetterhead(currentStep);
    const letterheadConfig = shouldShowLetterhead ? getLetterheadConfig() : null;

    // Create content with appropriate header
    const getContentWithHeader = (): string => {
        if (shouldShowLetterhead && letterheadConfig) {
            // For documents with letterheads, clean any existing letterhead and show clean content only
            let cleanContent = content || '';
            
            // Remove any letterhead HTML that might be in the content
            cleanContent = cleanContent.replace(/<div[^>]*letterhead[^>]*>[\s\S]*?<\/div>/gi, '');
            cleanContent = cleanContent.replace(/<table[^>]*>[\s\S]*?Republic of the Philippines[\s\S]*?SANGGUNIANG KABATAAN[\s\S]*?<\/table>/gi, '');
            cleanContent = cleanContent.replace(/<div[^>]*>[\s\S]*?Republic of the Philippines[\s\S]*?SANGGUNIANG KABATAAN[\s\S]*?<\/div>/gi, '');
            
            // Clean up any empty elements or extra spacing that might result
            cleanContent = cleanContent.replace(/<div[^>]*><\/div>/gi, '');
            cleanContent = cleanContent.replace(/<p[^>]*><\/p>/gi, '');
            cleanContent = cleanContent.replace(/^\s*<br[^>]*>\s*/gi, '');
            cleanContent = cleanContent.trim();
            
            // Return clean content without letterhead - letterhead will only appear in PDF
            return cleanContent || '';
        } else {
            // For documents without letterheads, add the default header to TipTap
            return DEFAULT_EDITOR_HEADER + (content ? '<br>' + content : '');
        }
    };

    const fullContent = getContentWithHeader();

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: fullContent,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4',
            },
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="w-full h-full flex flex-col">
            {/* Non-editable Letterhead Preview - Only for documents that need letterheads */}
            {shouldShowLetterhead && letterheadConfig && (
                <div className="bg-white border-b-2 border-gray-300 p-6 print:hidden">
                    <div className="max-w-full mx-auto">
                        {/* Letterhead Header */}
                        <div className="flex items-center justify-between mb-4">
                            {/* Left Logo */}
                            <div className="w-20 h-20 flex items-center justify-center">
                                {letterheadConfig.cityLogoUrl ? (
                                    <img 
                                        src={letterheadConfig.cityLogoUrl} 
                                        alt="City Logo" 
                                        className="w-20 h-20 object-contain"
                                    />
                                ) : (
                                    <div className="w-20 h-20 border-2 border-gray-300 flex items-center justify-center text-xs text-gray-400 text-center">
                                        City<br/>Logo
                                    </div>
                                )}
                            </div>

                            {/* Center Text */}
                            <div className="flex-1 text-center px-8">
                                <div className="font-serif text-black leading-tight">
                                    <div className="text-sm font-normal mb-1">Republic of the Philippines</div>
                                    <div className="text-lg font-bold mb-1">
                                        {letterheadConfig.provinceOrCity.toUpperCase()} OF {letterheadConfig.provinceCityName.toUpperCase()}
                                    </div>
                                    <div className="text-base font-normal mb-1">
                                        {letterheadConfig.municipalityOrCity === 'city' ? 'City' : 'Municipality'} of {letterheadConfig.municipalityCityName}
                                    </div>
                                    <div className="text-sm font-normal mb-2">
                                        Barangay {letterheadConfig.barangayName}
                                    </div>
                                    <div className="text-base font-bold">
                                        OFFICE OF THE SANGGUNIANG KABATAAN
                                    </div>
                                </div>
                            </div>

                            {/* Right Logo */}
                            <div className="w-20 h-20 flex items-center justify-center">
                                {letterheadConfig.skLogoUrl ? (
                                    <img 
                                        src={letterheadConfig.skLogoUrl} 
                                        alt="SK Logo" 
                                        className="w-20 h-20 object-contain"
                                    />
                                ) : (
                                    <div className="w-20 h-20 border-2 border-gray-300 flex items-center justify-center text-xs text-gray-400 text-center">
                                        SK<br/>Logo
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Horizontal Line */}
                        <div className="border-t-3 border-black w-full"></div>
                        
                        {/* Small spacing after line */}
                        <div className="mb-4"></div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="border-b p-2 bg-gray-50 flex flex-wrap gap-1">
                {/* Text Formatting */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                    <Button
                        variant={editor.isActive('bold') ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={editor.isActive('italic') ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={editor.isActive('strike') ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                    >
                        <Underline className="h-4 w-4" />
                    </Button>
                </div>

                {/* Headings */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                    <Button
                        variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                        H1
                    </Button>
                    <Button
                        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                        H2
                    </Button>
                    <Button
                        variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    >
                        H3
                    </Button>
                </div>

                {/* Lists */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                    <Button
                        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                </div>

                {/* Table Controls */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        title="Insert Table"
                    >
                        <TableIcon className="h-4 w-4" />
                    </Button>
                    
                    {/* Column Controls */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().addColumnBefore().run()}
                        disabled={!editor.can().addColumnBefore()}
                        title="Add Column Before"
                    >
                        <div className="flex items-center">
                            <Plus className="h-3 w-3" />
                            <Columns className="h-3 w-3" />
                        </div>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().addColumnAfter().run()}
                        disabled={!editor.can().addColumnAfter()}
                        title="Add Column After"
                    >
                        <div className="flex items-center">
                            <Columns className="h-3 w-3" />
                            <Plus className="h-3 w-3" />
                        </div>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().deleteColumn().run()}
                        disabled={!editor.can().deleteColumn()}
                        title="Delete Column"
                    >
                        <div className="flex items-center">
                            <Minus className="h-3 w-3" />
                            <Columns className="h-3 w-3" />
                        </div>
                    </Button>
                    
                    {/* Row Controls */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().addRowBefore().run()}
                        disabled={!editor.can().addRowBefore()}
                        title="Add Row Before"
                    >
                        <div className="flex flex-col items-center">
                            <Plus className="h-3 w-3" />
                            <Rows className="h-3 w-3" />
                        </div>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().addRowAfter().run()}
                        disabled={!editor.can().addRowAfter()}
                        title="Add Row After"
                    >
                        <div className="flex flex-col items-center">
                            <Rows className="h-3 w-3" />
                            <Plus className="h-3 w-3" />
                        </div>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().deleteRow().run()}
                        disabled={!editor.can().deleteRow()}
                        title="Delete Row"
                    >
                        <div className="flex flex-col items-center">
                            <Minus className="h-3 w-3" />
                            <Rows className="h-3 w-3" />
                        </div>
                    </Button>
                </div>

                {/* Block Elements */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                    <Button
                        variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                        <Quote className="h-4 w-4" />
                    </Button>
                </div>

                {/* Text Alignment */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                    <Button
                        variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Undo/Redo */}
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto bg-white">
                <div id="editor-content-for-export" className="h-full">
                    <EditorContent
                        editor={editor}
                        className="h-full"
                    />
                </div>
                {!content && placeholder && (
                    <div className="absolute top-16 left-4 text-gray-400 pointer-events-none">
                        {placeholder}
                    </div>
                )}
            </div>

            {/* Add styles for PDF export */}
            <style jsx global>{`
                .letterhead-for-export {
                    display: block !important;
                    page-break-inside: avoid;
                    margin-bottom: 20px;
                }
                
                /* Ensure clean PDF rendering */
                @media print {
                    body {
                        font-family: 'Times New Roman', Times, serif;
                    }
                }
                
                /* Custom border width for horizontal line */
                .border-t-3 {
                    border-top-width: 3px;
                }
            `}</style>
        </div>
    );
}