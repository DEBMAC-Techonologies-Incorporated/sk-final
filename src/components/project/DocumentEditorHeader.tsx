import React from 'react';
import { CheckCircle2, Circle, Save, Download, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ExportUtils } from '@/lib/exportUtils';

interface DocumentEditorHeaderProps {
    onBack: () => void;
    title: string;
    description?: string;
    content: string;
    isCompleted: boolean;
    onToggleComplete: () => void;
    onSave: () => void;
    isSaving: boolean;
    projectTitle?: string;
    documentTitle?: string;
    editorContentId?: string;
}

export default function DocumentEditorHeader({
    onBack,
    title,
    description = "Rich text editor - format your content like Google Docs",
    content,
    isCompleted,
    onToggleComplete,
    onSave,
    isSaving,
    projectTitle,
    documentTitle,
    editorContentId = 'editor-content-for-export'
}: DocumentEditorHeaderProps) {
    const characterCount = content.replace(/<[^>]*>/g, '').length;
    const exportFileName = projectTitle && documentTitle
        ? `${projectTitle}-${documentTitle}`
        : 'document';

    return (
        <CardHeader>
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBack}
                    >
                        ← Back to Documents
                    </Button>
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                        {characterCount} characters
                    </span>

                    <Button
                        variant={isCompleted ? "secondary" : "default"}
                        onClick={onToggleComplete}
                        size="sm"
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Completed
                            </>
                        ) : (
                            <>
                                <Circle className="h-4 w-4 mr-2" />
                                Complete
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={isSaving}
                        variant="outline"
                        size="sm"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => ExportUtils.exportMarkdown(content, exportFileName)}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        MD
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => ExportUtils.exportDocx(content, exportFileName)}
                    >
                        <FileDown className="h-4 w-4 mr-2" />
                        DOCX
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => ExportUtils.exportPdf(editorContentId, exportFileName)}
                    >
                        <FileDown className="h-4 w-4 mr-2" />
                        PDF
                    </Button>
                </div>
            </div>
        </CardHeader>
    );
} 