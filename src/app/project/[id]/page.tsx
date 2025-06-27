"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle, FileText, Save, Download, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { Project, ProjectStep, PROJECT_STEPS } from '@/lib/types';
import { formatDate, getProjectProgress } from '@/lib/utils';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { ExportUtils } from '@/lib/exportUtils';

interface ProjectPageProps {
    params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [project, setProject] = useState<Project | null>(null);
    const [activeStep, setActiveStep] = useState<ProjectStep>('planning');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Input field states
    const [documentTitle, setDocumentTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [requirements, setRequirements] = useState('');
    const [notes, setNotes] = useState('');
    const [showEditor, setShowEditor] = useState(false);

    useEffect(() => {
        const loadProject = () => {
            const foundProject = storage.getProject(resolvedParams.id);
            if (!foundProject) {
                router.push('/');
                return;
            }
            setProject(foundProject);
            setContent(foundProject.documents[activeStep].content);
            setIsLoading(false);
        };

        loadProject();
    }, [resolvedParams.id, router, activeStep]);

    useEffect(() => {
        if (project) {
            setContent(project.documents[activeStep].content);
            // Clear input fields and reset to input view when switching steps
            setDocumentTitle('');
            setSummary('');
            setRequirements('');
            setNotes('');
            setShowEditor(false);
        }
    }, [activeStep, project]);

    const handleStepChange = (step: ProjectStep) => {
        if (project && content !== project.documents[activeStep].content) {
            handleSave();
        }
        setActiveStep(step);
    };

    const handleSave = async () => {
        if (!project) return;

        setIsSaving(true);
        storage.updateStepDocument(project.id, activeStep, content);

        // Refresh project data
        const updatedProject = storage.getProject(project.id);
        if (updatedProject) {
            setProject(updatedProject);
        }

        setTimeout(() => setIsSaving(false), 500);
    };

    const toggleStepCompletion = () => {
        if (!project) return;

        storage.toggleStepCompletion(project.id, activeStep);
        const updatedProject = storage.getProject(project.id);
        if (updatedProject) {
            setProject(updatedProject);
        }
    };

    const generateDocument = () => {
        let generatedContent = '';

        if (documentTitle.trim()) {
            generatedContent += `<h1>${documentTitle.trim()}</h1>`;
        }

        if (summary.trim()) {
            generatedContent += `<h2>Summary</h2><p>${summary.trim().replace(/\n/g, '<br>')}</p>`;
        }

        if (requirements.trim()) {
            generatedContent += `<h2>Key Requirements</h2><p>${requirements.trim().replace(/\n/g, '<br>')}</p>`;
        }

        if (notes.trim()) {
            generatedContent += `<h2>Additional Notes</h2><p>${notes.trim().replace(/\n/g, '<br>')}</p>`;
        }

        if (!generatedContent) {
            generatedContent = `<h1>${currentStepInfo?.label} Document</h1><p>Please fill in the input fields and click Generate to create your document.</p>`;
        }

        setContent(generatedContent);
        setShowEditor(true);
    };

    const backToInputs = () => {
        setShowEditor(false);
    };

    const exportMarkdown = () => {
        if (!project) return;

        let markdown = `# ${project.title}\n\n`;
        markdown += `**Description:** ${project.description}\n\n`;
        markdown += `**Created:** ${formatDate(project.createdAt)}\n`;
        markdown += `**Last Modified:** ${formatDate(project.lastModified)}\n\n`;

        PROJECT_STEPS.forEach(step => {
            const doc = project.documents[step.key];
            markdown += `## ${step.label}\n\n`;
            markdown += `**Status:** ${doc.isCompleted ? '✅ Completed' : '⏳ In Progress'}\n\n`;
            markdown += doc.content || '*No content yet*';
            markdown += '\n\n---\n\n';
        });

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    const currentStepInfo = PROJECT_STEPS.find(s => s.key === activeStep);
    const currentDoc = project.documents[activeStep];
    const progress = getProjectProgress(project.completedSteps);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
                                <p className="text-muted-foreground">{project.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-muted-foreground">
                                Progress: <span className="font-medium">{progress}%</span>
                            </div>
                            <Button variant="outline" onClick={exportMarkdown}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Step Navigation */}
            <div className="border-b bg-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {PROJECT_STEPS.map((step, index) => {
                            const isCompleted = project.documents[step.key].isCompleted;
                            const isActive = activeStep === step.key;

                            return (
                                <button
                                    key={step.key}
                                    onClick={() => handleStepChange(step.key)}
                                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 whitespace-nowrap ${isActive
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span className="text-xs bg-muted text-muted-foreground rounded-full w-5 h-5 flex items-center justify-center">
                                            {index + 1}
                                        </span>
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Circle className="h-4 w-4" />
                                        )}
                                    </div>
                                    <span className="font-medium">{step.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!showEditor ? (
                    /* Input Fields View - Full Page */
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <span>{currentStepInfo?.label} - Document Setup</span>
                                {currentDoc.isCompleted && (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                )}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Fill in the details below to generate your {currentStepInfo?.label.toLowerCase()} document
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Input Fields Section */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                                        Document Title
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        value={documentTitle}
                                        onChange={(e) => setDocumentTitle(e.target.value)}
                                        placeholder="Enter document title..."
                                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="summary" className="block text-sm font-medium text-foreground mb-2">
                                        Summary
                                    </label>
                                    <textarea
                                        id="summary"
                                        rows={4}
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        placeholder="Brief summary of this step..."
                                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="requirements" className="block text-sm font-medium text-foreground mb-2">
                                        Key Requirements
                                    </label>
                                    <textarea
                                        id="requirements"
                                        rows={5}
                                        value={requirements}
                                        onChange={(e) => setRequirements(e.target.value)}
                                        placeholder="List key requirements or points..."
                                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                                        Additional Notes
                                    </label>
                                    <textarea
                                        id="notes"
                                        rows={4}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any additional notes or context..."
                                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                                    />
                                </div>
                            </div>

                            {/* Generate Button */}
                            <div className="pt-4 border-t">
                                <Button
                                    className="w-full"
                                    variant="default"
                                    size="lg"
                                    onClick={generateDocument}
                                >
                                    Generate Document
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* Document Editor View - Full Page */
                    <Card className="h-[calc(100vh-12rem)]">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={backToInputs}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Inputs
                                    </Button>
                                    <div>
                                        <CardTitle>Document Editor</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Rich text editor - format your content like Google Docs
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-muted-foreground">
                                        {content.replace(/<[^>]*>/g, '').length} characters
                                    </span>

                                    {/* Action Buttons */}
                                    <Button
                                        variant={currentDoc.isCompleted ? "secondary" : "default"}
                                        onClick={toggleStepCompletion}
                                        size="sm"
                                    >
                                        {currentDoc.isCompleted ? (
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
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </Button>

                                    {/* Export Options */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => ExportUtils.exportMarkdown(content, `${project?.title}-${currentStepInfo?.label}` || 'document')}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        MD
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => ExportUtils.exportDocx(content, `${project?.title}-${currentStepInfo?.label}` || 'document')}
                                    >
                                        <FileDown className="h-4 w-4 mr-2" />
                                        DOCX
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => ExportUtils.exportPdf('rich-editor-content', `${project?.title}-${currentStepInfo?.label}` || 'document')}
                                    >
                                        <FileDown className="h-4 w-4 mr-2" />
                                        PDF
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-full p-0">
                            <div id="rich-editor-content" className="h-full">
                                <RichTextEditor
                                    content={content}
                                    onChange={setContent}
                                    placeholder={`Write your ${currentStepInfo?.label.toLowerCase()} documentation here...\n\nUse the toolbar above to format your text with headings, bold, italic, lists, and more.`}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
} 