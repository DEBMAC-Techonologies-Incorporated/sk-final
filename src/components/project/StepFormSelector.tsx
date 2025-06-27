"use client";

import { ProjectStep } from '@/lib/types';
import PlanningForm, { PlanningFormData } from './steps/planning/PlanningForm';
import ApprovalForm, { ApprovalFormData } from './steps/approval/ApprovalForm';
import ResolutionForm, { ResolutionFormData } from './steps/resolution/ResolutionForm';
import DVForm, { DVFormData } from './steps/dv/DVForm';
import WithdrawalForm, { WithdrawalFormData } from './steps/withdrawal/WithdrawalForm';

// Union type for all form data types
export type StepFormData = PlanningFormData | ApprovalFormData | ResolutionFormData | DVFormData | WithdrawalFormData;

interface StepFormSelectorProps {
    activeStep: ProjectStep;
    isCompleted: boolean;
    onGenerate: (formData: StepFormData) => void;
}

export default function StepFormSelector({ activeStep, isCompleted, onGenerate }: StepFormSelectorProps) {
    switch (activeStep) {
        case 'planning':
            return (
                <PlanningForm
                    isCompleted={isCompleted}
                    onGenerate={(data) => onGenerate(data)}
                />
            );
        case 'approval':
            return (
                <ApprovalForm
                    isCompleted={isCompleted}
                    onGenerate={(data) => onGenerate(data)}
                />
            );
        case 'resolution':
            return (
                <ResolutionForm
                    isCompleted={isCompleted}
                    onGenerate={(data) => onGenerate(data)}
                />
            );
        case 'dv':
            return (
                <DVForm
                    isCompleted={isCompleted}
                    onGenerate={(data) => onGenerate(data)}
                />
            );
        case 'withdrawal':
            return (
                <WithdrawalForm
                    isCompleted={isCompleted}
                    onGenerate={(data) => onGenerate(data)}
                />
            );
        default:
            return null;
    }
} 