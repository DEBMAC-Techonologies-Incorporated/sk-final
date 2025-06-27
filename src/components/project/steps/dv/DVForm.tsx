"use client";

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface DVFormData {
    testPlan: string;
    validationCriteria: string;
    testScenarios: string;
    qualityAssurance: string;
    performanceMetrics: string;
}

interface DVFormProps {
    isCompleted: boolean;
    onGenerate: (formData: DVFormData) => void;
}

export default function DVForm({ isCompleted, onGenerate }: DVFormProps) {
    const [testPlan, setTestPlan] = useState('');
    const [validationCriteria, setValidationCriteria] = useState('');
    const [testScenarios, setTestScenarios] = useState('');
    const [qualityAssurance, setQualityAssurance] = useState('');
    const [performanceMetrics, setPerformanceMetrics] = useState('');

    const handleGenerate = () => {
        const formData: DVFormData = {
            testPlan,
            validationCriteria,
            testScenarios,
            qualityAssurance,
            performanceMetrics
        };
        onGenerate(formData);
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <span>Design Verification - Document Setup</span>
                    {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Define testing strategies, validation criteria, and quality assurance processes
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="testPlan" className="block text-sm font-medium text-foreground mb-2">
                            Test Plan & Strategy
                        </label>
                        <textarea
                            id="testPlan"
                            rows={4}
                            value={testPlan}
                            onChange={(e) => setTestPlan(e.target.value)}
                            placeholder="Describe the overall testing approach and methodology..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="validationCriteria" className="block text-sm font-medium text-foreground mb-2">
                            Validation Criteria
                        </label>
                        <textarea
                            id="validationCriteria"
                            rows={3}
                            value={validationCriteria}
                            onChange={(e) => setValidationCriteria(e.target.value)}
                            placeholder="Define what constitutes successful validation and acceptance..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="testScenarios" className="block text-sm font-medium text-foreground mb-2">
                            Test Scenarios & Cases
                        </label>
                        <textarea
                            id="testScenarios"
                            rows={4}
                            value={testScenarios}
                            onChange={(e) => setTestScenarios(e.target.value)}
                            placeholder="List key test scenarios, edge cases, and user acceptance tests..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="qualityAssurance" className="block text-sm font-medium text-foreground mb-2">
                            Quality Assurance Process
                        </label>
                        <textarea
                            id="qualityAssurance"
                            rows={3}
                            value={qualityAssurance}
                            onChange={(e) => setQualityAssurance(e.target.value)}
                            placeholder="QA procedures, review processes, and quality gates..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="performanceMetrics" className="block text-sm font-medium text-foreground mb-2">
                            Performance Metrics & KPIs
                        </label>
                        <textarea
                            id="performanceMetrics"
                            rows={3}
                            value={performanceMetrics}
                            onChange={(e) => setPerformanceMetrics(e.target.value)}
                            placeholder="Performance benchmarks, success metrics, and monitoring..."
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
                        Generate Design Verification Document
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 