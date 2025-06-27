"use client";

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface PlanningFormData {
    projectScope: string;
    stakeholders: string;
    timeline: string;
    budget: string;
    risks: string;
}

interface PlanningFormProps {
    isCompleted: boolean;
    onGenerate: (formData: PlanningFormData) => void;
}

export default function PlanningForm({ isCompleted, onGenerate }: PlanningFormProps) {
    const [projectScope, setProjectScope] = useState('');
    const [stakeholders, setStakeholders] = useState('');
    const [timeline, setTimeline] = useState('');
    const [budget, setBudget] = useState('');
    const [risks, setRisks] = useState('');

    const handleGenerate = () => {
        const formData: PlanningFormData = {
            projectScope,
            stakeholders,
            timeline,
            budget,
            risks
        };
        onGenerate(formData);
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <span>Planning - Document Setup</span>
                    {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Define the project scope, requirements, and initial strategy
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="projectScope" className="block text-sm font-medium text-foreground mb-2">
                            Project Scope
                        </label>
                        <textarea
                            id="projectScope"
                            rows={4}
                            value={projectScope}
                            onChange={(e) => setProjectScope(e.target.value)}
                            placeholder="Define the project scope, objectives, and deliverables..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="stakeholders" className="block text-sm font-medium text-foreground mb-2">
                            Key Stakeholders
                        </label>
                        <textarea
                            id="stakeholders"
                            rows={3}
                            value={stakeholders}
                            onChange={(e) => setStakeholders(e.target.value)}
                            placeholder="List key stakeholders, their roles, and responsibilities..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="timeline" className="block text-sm font-medium text-foreground mb-2">
                            Project Timeline
                        </label>
                        <textarea
                            id="timeline"
                            rows={3}
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                            placeholder="Outline major milestones and timeline..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-foreground mb-2">
                            Budget & Resources
                        </label>
                        <textarea
                            id="budget"
                            rows={3}
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="Estimated budget and required resources..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="risks" className="block text-sm font-medium text-foreground mb-2">
                            Initial Risk Assessment
                        </label>
                        <textarea
                            id="risks"
                            rows={3}
                            value={risks}
                            onChange={(e) => setRisks(e.target.value)}
                            placeholder="Identify potential risks and mitigation strategies..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <Button
                        className="w-full"
                        variant="default"
                        size="lg"
                        onClick={handleGenerate}
                    >
                        Generate Planning Document
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 