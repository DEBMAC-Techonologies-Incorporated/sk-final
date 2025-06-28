"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { Project, PROJECT_STEPS } from '@/lib/types';
import { formatDate, getProjectProgress } from '@/lib/utils';
import BudgetDisplay from '@/components/budget/BudgetDisplay';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface ProjectLayoutProps {
    children: React.ReactNode;
    params: { id: string };
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProject = () => {
            const foundProject = storage.getProject(params.id);
            if (!foundProject) {
                router.push('/');
                return;
            }
            setProject(foundProject);
            setIsLoading(false);
        };

        loadProject();
    }, [params.id, router]);

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
                    <p className="text-muted-foreground">Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    const progress = getProjectProgress(project.completedSteps);
    const currentStep = pathname.split('/').pop() || '';

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
                            <ThemeToggle />
                            <Button variant="outline" onClick={exportMarkdown}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                    {/* Budget Display */}
                    <div className="pb-4">
                        <BudgetDisplay projectId={project.id} compact={true} />
                    </div>
                </div>
            </header>

            {/* Step Navigation */}
            <div className="border-b bg-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8 overflow-x-auto">
                        <Link
                            href={`/project/${params.id}`}
                            className={`flex items-center space-x-2 py-4 px-2 border-b-2 whitespace-nowrap ${pathname === `/project/${params.id}`
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <span className="font-medium">Overview</span>
                        </Link>
                        {PROJECT_STEPS.map((step, index) => {
                            const isCompleted = project.documents[step.key].isCompleted;
                            const isActive = currentStep === step.key;
                            const stepPath = `/project/${params.id}/${step.key}`;

                            return (
                                <Link
                                    key={step.key}
                                    href={stepPath}
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
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
} 