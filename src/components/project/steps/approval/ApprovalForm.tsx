"use client";

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ApprovalFormData {
    approvalCriteria: string;
    stakeholderSignoffs: string;
    complianceRequirements: string;
    reviewProcess: string;
    documentation: string;
}

interface ApprovalFormProps {
    isCompleted: boolean;
    onGenerate: (formData: ApprovalFormData) => void;
}

export default function ApprovalForm({ isCompleted, onGenerate }: ApprovalFormProps) {
    const [approvalCriteria, setApprovalCriteria] = useState('');
    const [stakeholderSignoffs, setStakeholderSignoffs] = useState('');
    const [complianceRequirements, setComplianceRequirements] = useState('');
    const [reviewProcess, setReviewProcess] = useState('');
    const [documentation, setDocumentation] = useState('');

    const handleGenerate = () => {
        const formData: ApprovalFormData = {
            approvalCriteria,
            stakeholderSignoffs,
            complianceRequirements,
            reviewProcess,
            documentation
        };
        onGenerate(formData);
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <span>Approval - Document Setup</span>
                    {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Define approval criteria, stakeholder sign-offs, and authorization requirements
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="approvalCriteria" className="block text-sm font-medium text-foreground mb-2">
                            Approval Criteria
                        </label>
                        <textarea
                            id="approvalCriteria"
                            rows={4}
                            value={approvalCriteria}
                            onChange={(e) => setApprovalCriteria(e.target.value)}
                            placeholder="Define what needs to be approved and success criteria..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="stakeholderSignoffs" className="block text-sm font-medium text-foreground mb-2">
                            Required Stakeholder Sign-offs
                        </label>
                        <textarea
                            id="stakeholderSignoffs"
                            rows={3}
                            value={stakeholderSignoffs}
                            onChange={(e) => setStakeholderSignoffs(e.target.value)}
                            placeholder="List who needs to approve and their authority levels..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="complianceRequirements" className="block text-sm font-medium text-foreground mb-2">
                            Compliance & Regulatory Requirements
                        </label>
                        <textarea
                            id="complianceRequirements"
                            rows={3}
                            value={complianceRequirements}
                            onChange={(e) => setComplianceRequirements(e.target.value)}
                            placeholder="Any regulatory, legal, or compliance requirements..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="reviewProcess" className="block text-sm font-medium text-foreground mb-2">
                            Review Process
                        </label>
                        <textarea
                            id="reviewProcess"
                            rows={3}
                            value={reviewProcess}
                            onChange={(e) => setReviewProcess(e.target.value)}
                            placeholder="Describe the review workflow and timeline..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="documentation" className="block text-sm font-medium text-foreground mb-2">
                            Supporting Documentation
                        </label>
                        <textarea
                            id="documentation"
                            rows={3}
                            value={documentation}
                            onChange={(e) => setDocumentation(e.target.value)}
                            placeholder="List required documents and evidence for approval..."
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
                        Generate Approval Document
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 