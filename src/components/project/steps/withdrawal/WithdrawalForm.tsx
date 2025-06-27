"use client";

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface WithdrawalFormData {
    projectSummary: string;
    lessonsLearned: string;
    finalDeliverables: string;
    stakeholderFeedback: string;
    futureRecommendations: string;
}

interface WithdrawalFormProps {
    isCompleted: boolean;
    onGenerate: (formData: WithdrawalFormData) => void;
}

export default function WithdrawalForm({ isCompleted, onGenerate }: WithdrawalFormProps) {
    const [projectSummary, setProjectSummary] = useState('');
    const [lessonsLearned, setLessonsLearned] = useState('');
    const [finalDeliverables, setFinalDeliverables] = useState('');
    const [stakeholderFeedback, setStakeholderFeedback] = useState('');
    const [futureRecommendations, setFutureRecommendations] = useState('');

    const handleGenerate = () => {
        const formData: WithdrawalFormData = {
            projectSummary,
            lessonsLearned,
            finalDeliverables,
            stakeholderFeedback,
            futureRecommendations
        };
        onGenerate(formData);
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <span>Withdrawal - Document Setup</span>
                    {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Document project closure, lessons learned, and final reports
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="projectSummary" className="block text-sm font-medium text-foreground mb-2">
                            Project Summary
                        </label>
                        <textarea
                            id="projectSummary"
                            rows={4}
                            value={projectSummary}
                            onChange={(e) => setProjectSummary(e.target.value)}
                            placeholder="Summarize the project outcome, achievements, and final status..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="lessonsLearned" className="block text-sm font-medium text-foreground mb-2">
                            Lessons Learned
                        </label>
                        <textarea
                            id="lessonsLearned"
                            rows={4}
                            value={lessonsLearned}
                            onChange={(e) => setLessonsLearned(e.target.value)}
                            placeholder="Document key insights, challenges overcome, and knowledge gained..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="finalDeliverables" className="block text-sm font-medium text-foreground mb-2">
                            Final Deliverables
                        </label>
                        <textarea
                            id="finalDeliverables"
                            rows={3}
                            value={finalDeliverables}
                            onChange={(e) => setFinalDeliverables(e.target.value)}
                            placeholder="List all completed deliverables and their status..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="stakeholderFeedback" className="block text-sm font-medium text-foreground mb-2">
                            Stakeholder Feedback
                        </label>
                        <textarea
                            id="stakeholderFeedback"
                            rows={3}
                            value={stakeholderFeedback}
                            onChange={(e) => setStakeholderFeedback(e.target.value)}
                            placeholder="Summarize feedback from key stakeholders and project sponsors..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="futureRecommendations" className="block text-sm font-medium text-foreground mb-2">
                            Future Recommendations
                        </label>
                        <textarea
                            id="futureRecommendations"
                            rows={3}
                            value={futureRecommendations}
                            onChange={(e) => setFutureRecommendations(e.target.value)}
                            placeholder="Recommendations for future projects and improvements..."
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
                        Generate Withdrawal Document
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 