"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Save, Download, FileDown, FileText, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { Project } from '@/lib/types';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { ExportUtils } from '@/lib/exportUtils';
import ApprovalForm, { ApprovalFormData } from '@/components/project/steps/approval/ApprovalForm';
import DocumentEditorHeader from '@/components/project/DocumentEditorHeader';
import DocumentsList from '@/components/project/DocumentsList';

interface ApprovalPageProps {
    params: Promise<{ id: string }>;
}

// Structure for multiple documents
interface StepDocument {
    id: string;
    title: string;
    content: string;
    type: 'approval-request' | 'committee-minutes' | 'approval-certificate';
}

export default function ApprovalPage({ params }: ApprovalPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showDocuments, setShowDocuments] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<StepDocument | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [documents, setDocuments] = useState<StepDocument[]>([]);

    useEffect(() => {
        const loadProject = () => {
            const foundProject = storage.getProject(id);
            if (!foundProject) {
                router.push('/');
                return;
            }
            setProject(foundProject);

            // Check if there's existing content, create mock documents
            if (foundProject.documents.approval.content.trim().length > 0) {
                const mockDocs: StepDocument[] = [
                    {
                        id: 'approval-request',
                        title: 'Approval Request',
                        content: foundProject.documents.approval.content,
                        type: 'approval-request'
                    },
                    {
                        id: 'committee-minutes',
                        title: 'Committee Meeting Minutes',
                        content: '',
                        type: 'committee-minutes'
                    }
                ];
                setDocuments(mockDocs);
                setShowDocuments(true);
            }
            setIsLoading(false);
        };

        loadProject();
    }, [id, router]);

    const handleSave = async () => {
        if (!project || !selectedDocument) return;

        setIsSaving(true);

        const updatedDocs = documents.map(doc =>
            doc.id === selectedDocument.id
                ? { ...doc, content: editingContent }
                : doc
        );
        setDocuments(updatedDocs);

        const primaryContent = updatedDocs.find(doc => doc.type === 'approval-request')?.content || editingContent;
        storage.updateStepDocument(project.id, 'approval', primaryContent);

        const updatedProject = storage.getProject(project.id);
        if (updatedProject) {
            setProject(updatedProject);
        }

        setTimeout(() => setIsSaving(false), 500);
    };

    const toggleStepCompletion = () => {
        if (!project) return;

        storage.toggleStepCompletion(project.id, 'approval');
        const updatedProject = storage.getProject(project.id);
        if (updatedProject) {
            setProject(updatedProject);
        }
    };

    const handleGenerateDocument = async (formData: ApprovalFormData) => {
        setIsGenerating(true);

        try {
            const response = await fetch('/api/generate-document', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    step: 'approval',
                    formData: formData
                }),
            });

            const data = await response.json();

            if (data.success) {
                const generatedDocs: StepDocument[] = [
                    {
                        id: 'approval-request',
                        title: 'Approval Request',
                        content: data.content,
                        type: 'approval-request'
                    },
                    {
                        id: 'committee-minutes',
                        title: 'Committee Meeting Minutes',
                        content: `<h2>Committee Meeting Minutes</h2><p>Meeting minutes for the approval process.</p><p><strong>Request:</strong> Approval for specified activity</p><p><em>This document will be expanded with more content in future updates.</em></p>`,
                        type: 'committee-minutes'
                    }
                ];

                setDocuments(generatedDocs);
                setShowDocuments(true);
            } else {
                alert('Failed to generate document: ' + data.error);
            }
        } catch (error) {
            console.error('Error generating document:', error);
            alert('An error occurred while generating the document. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const openDocumentEditor = (document: StepDocument) => {
        setSelectedDocument(document);
        setEditingContent(document.content);
    };

    const closeDocumentEditor = () => {
        setSelectedDocument(null);
        setEditingContent('');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <p className="text-muted-foreground">Loading approval step...</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    const currentDoc = project.documents.approval;

    // Document Editor View
    if (selectedDocument) {
        return (
            <Card className="h-[calc(100vh-12rem)]">
                <DocumentEditorHeader
                    onBack={closeDocumentEditor}
                    title={selectedDocument.title}
                    content={editingContent}
                    isCompleted={currentDoc.isCompleted}
                    onToggleComplete={toggleStepCompletion}
                    onSave={handleSave}
                    isSaving={isSaving}
                    projectTitle={project?.title}
                    documentTitle={selectedDocument.title}
                />
                <CardContent className="h-full p-0">
                    <div id="rich-editor-content" className="h-full">
                        <RichTextEditor
                            content={editingContent}
                            onChange={setEditingContent}
                            placeholder="Write your approval documentation here...\n\nUse the toolbar above to format your text with headings, bold, italic, lists, and more."
                        />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Documents List View
    if (showDocuments) {
        return (
            <DocumentsList
                documents={documents}
                stepName="Approval"
                onBack={() => setShowDocuments(false)}
                onEditDocument={openDocumentEditor}
            />
        );
    }

    // Form View (default)
    return (
        <ApprovalForm
            isCompleted={currentDoc.isCompleted}
            onGenerate={handleGenerateDocument}
        />
    );
} 