"use client";

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ResolutionFormData {
    technicalSolution: string;
    implementationPlan: string;
    resourceAllocation: string;
    deliverables: string;
    qualityStandards: string;
}

interface ResolutionFormProps {
    isCompleted: boolean;
    onGenerate: (formData: ResolutionFormData) => void;
}

export default function ResolutionForm({ isCompleted, onGenerate }: ResolutionFormProps) {
    const [technicalSolution, setTechnicalSolution] = useState('');
    const [implementationPlan, setImplementationPlan] = useState('');
    const [resourceAllocation, setResourceAllocation] = useState('');
    const [deliverables, setDeliverables] = useState('');
    const [qualityStandards, setQualityStandards] = useState('');

    const handleGenerate = () => {
        const formData: ResolutionFormData = {
            technicalSolution,
            implementationPlan,
            resourceAllocation,
            deliverables,
            qualityStandards
        };
        onGenerate(formData);
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <span>Resolution - Document Setup</span>
                    {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Detail the technical solution, implementation details, and execution plans
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="technicalSolution" className="block text-sm font-medium text-foreground mb-2">
                            Technical Solution
                        </label>
                        <textarea
                            id="technicalSolution"
                            rows={4}
                            value={technicalSolution}
                            onChange={(e) => setTechnicalSolution(e.target.value)}
                            placeholder="Describe the technical approach and solution architecture..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="implementationPlan" className="block text-sm font-medium text-foreground mb-2">
                            Implementation Plan
                        </label>
                        <textarea
                            id="implementationPlan"
                            rows={4}
                            value={implementationPlan}
                            onChange={(e) => setImplementationPlan(e.target.value)}
                            placeholder="Detailed implementation steps, phases, and timeline..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="resourceAllocation" className="block text-sm font-medium text-foreground mb-2">
                            Resource Allocation
                        </label>
                        <textarea
                            id="resourceAllocation"
                            rows={3}
                            value={resourceAllocation}
                            onChange={(e) => setResourceAllocation(e.target.value)}
                            placeholder="Team assignments, tools, and resource requirements..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="deliverables" className="block text-sm font-medium text-foreground mb-2">
                            Key Deliverables
                        </label>
                        <textarea
                            id="deliverables"
                            rows={3}
                            value={deliverables}
                            onChange={(e) => setDeliverables(e.target.value)}
                            placeholder="List specific deliverables and completion criteria..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="qualityStandards" className="block text-sm font-medium text-foreground mb-2">
                            Quality Standards & Metrics
                        </label>
                        <textarea
                            id="qualityStandards"
                            rows={3}
                            value={qualityStandards}
                            onChange={(e) => setQualityStandards(e.target.value)}
                            placeholder="Quality requirements, acceptance criteria, and success metrics..."
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
                        Generate Resolution Document
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 