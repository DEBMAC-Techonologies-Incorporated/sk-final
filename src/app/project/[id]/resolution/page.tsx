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
import ResolutionForm, { ResolutionFormData } from '@/components/project/steps/resolution/ResolutionForm';
import DocumentEditorHeader from '@/components/project/DocumentEditorHeader';
import DocumentsList from '@/components/project/DocumentsList';

interface ResolutionPageProps {
    params: Promise<{ id: string }>;
}

// Structure for multiple documents
interface StepDocument {
    id: string;
    title: string;
    content: string;
    type: 'resolution-draft' | 'ordinance' | 'implementation-plan';
}

export default function ResolutionPage({ params }: ResolutionPageProps) {
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
            if (foundProject.documents.resolution.content.trim().length > 0) {
                const mockDocs: StepDocument[] = [
                    {
                        id: 'resolution-draft',
                        title: 'Resolution Draft',
                        content: foundProject.documents.resolution.content,
                        type: 'resolution-draft'
                    },
                    {
                        id: 'implementation-plan',
                        title: 'Implementation Plan',
                        content: '',
                        type: 'implementation-plan'
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

        const primaryContent = updatedDocs.find(doc => doc.type === 'resolution-draft')?.content || editingContent;
        storage.updateStepDocument(project.id, 'resolution', primaryContent);

        const updatedProject = storage.getProject(project.id);
        if (updatedProject) {
            setProject(updatedProject);
        }

        setTimeout(() => setIsSaving(false), 500);
    };

    const toggleStepCompletion = () => {
        if (!project) return;

        storage.toggleStepCompletion(project.id, 'resolution');
        const updatedProject = storage.getProject(project.id);
        if (updatedProject) {
            setProject(updatedProject);
        }
    };

    const handleGenerateDocument = async (formData: ResolutionFormData) => {
        setIsGenerating(true);

        try {
            const response = await fetch('/api/generate-document', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    step: 'resolution',
                    formData: formData
                }),
            });

            const data = await response.json();

            if (data.success) {
                const generatedDocs: StepDocument[] = [
                    {
                        id: 'resolution-draft',
                        title: 'Resolution Draft',
                        content: data.content,
                        type: 'resolution-draft'
                    },
                    {
                        id: 'implementation-plan',
                        title: 'Implementation Plan',
                        content: `<h2>Implementation Plan</h2><p>This implementation plan outlines the execution of the resolution.</p><p><strong>Resolution:</strong> Resolution for specified purpose</p><p><em>This document will be expanded with more content in future updates.</em></p>`,
                        type: 'implementation-plan'
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
                    <p className="text-muted-foreground">Loading resolution step...</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    const currentDoc = project.documents.resolution;

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
                    currentStep="resolution"
                />
                <CardContent className="h-full p-0">
                    <div id="rich-editor-content" className="h-full">
                        <RichTextEditor
                            content={editingContent}
                            onChange={setEditingContent}
                            placeholder="Write your resolution documentation here...\n\nUse the toolbar above to format your text with headings, bold, italic, lists, and more."
                            currentStep="resolution"
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
                stepName="Resolution"
                onBack={() => setShowDocuments(false)}
                onEditDocument={openDocumentEditor}
            />
        );
    }

    // Form View (default)
    return (
        <ResolutionForm
            isCompleted={currentDoc.isCompleted}
            onGenerate={handleGenerateDocument}
        />
    );
} 