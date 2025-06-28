import React from 'react';
import { FileText, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BaseDocument {
    id: string;
    title: string;
    content: string;
    type: string;
}

interface DocumentsListProps<T extends BaseDocument = BaseDocument> {
    documents: T[];
    stepName: string;
    onBack: () => void;
    onEditDocument: (document: T) => void;
}

export default function DocumentsList<T extends BaseDocument>({
    documents,
    stepName,
    onBack,
    onEditDocument
}: DocumentsListProps<T>) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">{stepName} Documents</h2>
                    <p className="text-muted-foreground">
                        Select a document to edit or review its content
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={onBack}
                >
                    ← Back to Form
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((document) => (
                    <Card key={document.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{document.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {document.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                                        {document.content.length > 100 ? '...' : ''}
                                    </p>
                                </div>
                                <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                    {document.content.replace(/<[^>]*>/g, '').length} characters
                                </span>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => onEditDocument(document)}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Document
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 