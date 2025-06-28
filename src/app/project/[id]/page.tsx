"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Circle, FileText, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { Project, PROJECT_STEPS } from '@/lib/types';
import { formatDate, getProjectProgress } from '@/lib/utils';

interface ProjectPageProps {
    params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProject = () => {
            const foundProject = storage.getProject(id);
            if (!foundProject) {
                router.push('/');
                return;
            }
            setProject(foundProject);
            setIsLoading(false);
        };

        loadProject();
    }, [id, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    const progress = getProjectProgress(project.completedSteps);
    const completedSteps = PROJECT_STEPS.filter(step => project.documents[step.key].isCompleted);
    const pendingSteps = PROJECT_STEPS.filter(step => !project.documents[step.key].isCompleted);

    return (
        <div className="space-y-8">
            {/* Project Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progress</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress}%</div>
                        <p className="text-xs text-muted-foreground">
                            {completedSteps.length} of {PROJECT_STEPS.length} steps completed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Created</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDate(project.createdAt)}</div>
                        <p className="text-xs text-muted-foreground">Project start date</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Modified</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDate(project.lastModified)}</div>
                        <p className="text-xs text-muted-foreground">Most recent update</p>
                    </CardContent>
                </Card>
            </div>

            {/* Steps Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Project Steps</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Click on any step to start working on it
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {PROJECT_STEPS.map((step, index) => {
                                const doc = project.documents[step.key];
                                const isCompleted = doc.isCompleted;
                                const hasContent = doc.content && doc.content.trim().length > 0;

                                return (
                                    <Link
                                        key={step.key}
                                        href={`/project/${id}/${step.key}`}
                                        className="block"
                                    >
                                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center">
                                                        {index + 1}
                                                    </span>
                                                    {isCompleted ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{step.label}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {isCompleted ? 'Completed' : hasContent ? 'In Progress' : 'Not Started'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                {hasContent ? 'Continue' : 'Start'}
                                            </Button>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Common actions for this project
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {pendingSteps.length > 0 && (
                                <Link href={`/project/${id}/${pendingSteps[0].key}`}>
                                    <Button className="w-full justify-start" variant="default">
                                        <Circle className="h-4 w-4 mr-2" />
                                        Continue Next Step: {pendingSteps[0].label}
                                    </Button>
                                </Link>
                            )}
                            <Link href={`/budget?projectId=${id}`}>
                                <Button className="w-full justify-start" variant="outline">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Manage Budget
                                </Button>
                            </Link>
                            {completedSteps.length > 0 && (
                                <Link href={`/project/${id}/${completedSteps[completedSteps.length - 1].key}`}>
                                    <Button className="w-full justify-start" variant="outline">
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Review Last Completed: {completedSteps[completedSteps.length - 1].label}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            {completedSteps.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {completedSteps.slice(-3).reverse().map((step) => (
                                <div key={step.key} className="flex items-center space-x-3 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span>Completed <strong>{step.label}</strong></span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-muted-foreground">{formatDate(project.lastModified)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}