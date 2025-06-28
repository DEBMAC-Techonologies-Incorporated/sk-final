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
import { PlanningForm, PlanningFormData } from '@/components/project/steps/planning';
import DocumentEditorHeader from '@/components/project/DocumentEditorHeader';
import DocumentsList from '@/components/project/DocumentsList';

interface PlanningPageProps {
    params: Promise<{ id: string }>;
}

// Mock structure for multiple documents - will be expanded in the future
interface StepDocument {
    id: string;
    title: string;
    content: string;
    type: 'form' | 'authorization' | 'report';
}

export default function PlanningPage({ params }: PlanningPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showDocuments, setShowDocuments] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<StepDocument | null>(null);
    const [editingContent, setEditingContent] = useState('');

    // Mock documents structure - in the future this will come from the API
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
            if (foundProject.documents.planning.content.trim().length > 0) {
                const mockDocs: StepDocument[] = [
                    {
                        id: 'purchase-request',
                        title: 'Purchase Request Form',
                        content: foundProject.documents.planning.content,
                        type: 'form'
                    },
                    {
                        id: 'purchase-authorization',
                        title: 'Purchase Request Authorization Form',
                        content: '', // Will be populated when multiple docs are generated
                        type: 'authorization'
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

        // Update the document content
        const updatedDocs = documents.map(doc =>
            doc.id === selectedDocument.id
                ? { ...doc, content: editingContent }
                : doc
        );
        setDocuments(updatedDocs);

        // Save to storage (for now, save the first document's content to maintain compatibility)
        const primaryContent = updatedDocs.find(doc => doc.type === 'form')?.content || editingContent;
        storage.updateStepDocument(project.id, 'planning', primaryContent);

        // Refresh project data
        const updatedProject = storage.getProject(project.id);
        if (updatedProject) {
            setProject(updatedProject);
        }

        setTimeout(() => setIsSaving(false), 500);
    };

    const toggleStepCompletion = () => {
        if (!project) return;

        storage.toggleStepCompletion(project.id, 'planning');
        const updatedProject = storage.getProject(project.id);
        if (updatedProject) {
            setProject(updatedProject);
        }
    };

    const handleGenerateDocument = async (formData: PlanningFormData) => {
        setIsGenerating(true);

        try {
            const response = await fetch('/api/generate-document', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    step: 'planning',
                    formData: formData
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Clean the AI-generated content first (remove markdown code blocks)
                let cleanContent = data.content;
                
                // Remove ```html at the beginning
                if (cleanContent.startsWith('```html')) {
                    cleanContent = cleanContent.substring(7);
                } else if (cleanContent.startsWith('```')) {
                    cleanContent = cleanContent.substring(3);
                }
                
                // Remove trailing ``` at the end
                if (cleanContent.endsWith('```')) {
                    cleanContent = cleanContent.substring(0, cleanContent.length - 3);
                }
                
                // Trim any extra whitespace
                cleanContent = cleanContent.trim();

                // Parse the cleaned content to split into two documents
                const fullContent = cleanContent;
                const splitKeyword = "PURCHASE REQUEST AUTHORIZATION FORM";
                const splitIndex = fullContent.indexOf(splitKeyword);

                let purchaseRequestContent = fullContent;
                let purchaseAuthorizationContent = `<h2>Purchase Request Authorization Form</h2><p>This authorization form is generated based on the purchase request.</p><p><strong>Related to:</strong> ${formData.activityName || 'Planning Request'}</p><p><em>This document will be expanded with more content in future updates.</em></p>`;

                // If the split keyword is found, divide the content
                if (splitIndex !== -1) {
                    purchaseRequestContent = fullContent.substring(0, splitIndex).trim();
                    
                    // Look for the opening tag that contains the keyword to preserve styling
                    const beforeKeyword = fullContent.substring(0, splitIndex);
                    const lastOpenTag = beforeKeyword.lastIndexOf('<');
                    const nextCloseTag = fullContent.indexOf('>', splitIndex);
                    
                    // If we find tags around the keyword, include the opening tag with the authorization content
                    if (lastOpenTag !== -1 && nextCloseTag !== -1) {
                        const tagStart = fullContent.substring(lastOpenTag, splitIndex);
                        // Check if this looks like an opening tag (not a closing tag)
                        if (!tagStart.includes('</')) {
                            purchaseRequestContent = fullContent.substring(0, lastOpenTag).trim();
                            purchaseAuthorizationContent = fullContent.substring(lastOpenTag).trim();
                        } else {
                            purchaseAuthorizationContent = fullContent.substring(splitIndex).trim();
                        }
                    } else {
                        purchaseAuthorizationContent = fullContent.substring(splitIndex).trim();
                    }
                }

                // Create multiple documents structure
                const generatedDocs: StepDocument[] = [
                    {
                        id: 'purchase-request',
                        title: 'Purchase Request Form',
                        content: purchaseRequestContent,
                        type: 'form'
                    },
                    {
                        id: 'purchase-authorization',
                        title: 'Purchase Request Authorization Form',
                        content: purchaseAuthorizationContent,
                        type: 'authorization'
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
                    <p className="text-muted-foreground">Loading planning step...</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    const currentDoc = project.documents.planning;

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
                    currentStep="planning"
                />
                <CardContent className="h-full p-0">
                    <div id="rich-editor-content" className="h-full">
                        <RichTextEditor
                            content={editingContent}
                            onChange={setEditingContent}
                            placeholder="Write your planning documentation here...\n\nUse the toolbar above to format your text with headings, bold, italic, lists, and more."
                            currentStep="planning"
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
                stepName="Planning"
                onBack={() => setShowDocuments(false)}
                onEditDocument={openDocumentEditor}
            />
        );
    }

    // Form View (default)
    return (
        <PlanningForm
            isCompleted={currentDoc.isCompleted}
            onGenerate={handleGenerateDocument}
            isGenerating={isGenerating}
        />
    );
}