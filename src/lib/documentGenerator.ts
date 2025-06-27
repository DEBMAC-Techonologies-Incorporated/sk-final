import { ProjectStep, PROJECT_STEPS } from './types';
import type { StepFormData } from '@/components/project/StepFormSelector';
import type { PlanningFormData } from '@/components/project/steps/planning/PlanningForm';
import type { ApprovalFormData } from '@/components/project/steps/approval/ApprovalForm';
import type { ResolutionFormData } from '@/components/project/steps/resolution/ResolutionForm';
import type { DVFormData } from '@/components/project/steps/dv/DVForm';
import type { WithdrawalFormData } from '@/components/project/steps/withdrawal/WithdrawalForm';

export function generateDocumentContent(activeStep: ProjectStep, formData: StepFormData): string {
    const currentStepInfo = PROJECT_STEPS.find(s => s.key === activeStep);
    const stepLabel = currentStepInfo?.label || 'Document';

    let generatedContent = `<h1>${stepLabel} Document</h1>`;

    switch (activeStep) {
        case 'planning': {
            const data = formData as PlanningFormData;
            if (data.projectScope.trim()) {
                generatedContent += `<h2>Project Scope</h2><p>${data.projectScope.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.stakeholders.trim()) {
                generatedContent += `<h2>Key Stakeholders</h2><p>${data.stakeholders.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.timeline.trim()) {
                generatedContent += `<h2>Project Timeline</h2><p>${data.timeline.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.budget.trim()) {
                generatedContent += `<h2>Budget & Resources</h2><p>${data.budget.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.risks.trim()) {
                generatedContent += `<h2>Initial Risk Assessment</h2><p>${data.risks.trim().replace(/\n/g, '<br>')}</p>`;
            }
            break;
        }
        case 'approval': {
            const data = formData as ApprovalFormData;
            if (data.approvalCriteria.trim()) {
                generatedContent += `<h2>Approval Criteria</h2><p>${data.approvalCriteria.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.stakeholderSignoffs.trim()) {
                generatedContent += `<h2>Required Stakeholder Sign-offs</h2><p>${data.stakeholderSignoffs.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.complianceRequirements.trim()) {
                generatedContent += `<h2>Compliance & Regulatory Requirements</h2><p>${data.complianceRequirements.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.reviewProcess.trim()) {
                generatedContent += `<h2>Review Process</h2><p>${data.reviewProcess.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.documentation.trim()) {
                generatedContent += `<h2>Supporting Documentation</h2><p>${data.documentation.trim().replace(/\n/g, '<br>')}</p>`;
            }
            break;
        }
        case 'resolution': {
            const data = formData as ResolutionFormData;
            if (data.technicalSolution.trim()) {
                generatedContent += `<h2>Technical Solution</h2><p>${data.technicalSolution.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.implementationPlan.trim()) {
                generatedContent += `<h2>Implementation Plan</h2><p>${data.implementationPlan.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.resourceAllocation.trim()) {
                generatedContent += `<h2>Resource Allocation</h2><p>${data.resourceAllocation.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.deliverables.trim()) {
                generatedContent += `<h2>Key Deliverables</h2><p>${data.deliverables.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.qualityStandards.trim()) {
                generatedContent += `<h2>Quality Standards & Metrics</h2><p>${data.qualityStandards.trim().replace(/\n/g, '<br>')}</p>`;
            }
            break;
        }
        case 'dv': {
            const data = formData as DVFormData;
            if (data.testPlan.trim()) {
                generatedContent += `<h2>Test Plan & Strategy</h2><p>${data.testPlan.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.validationCriteria.trim()) {
                generatedContent += `<h2>Validation Criteria</h2><p>${data.validationCriteria.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.testScenarios.trim()) {
                generatedContent += `<h2>Test Scenarios & Cases</h2><p>${data.testScenarios.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.qualityAssurance.trim()) {
                generatedContent += `<h2>Quality Assurance Process</h2><p>${data.qualityAssurance.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.performanceMetrics.trim()) {
                generatedContent += `<h2>Performance Metrics & KPIs</h2><p>${data.performanceMetrics.trim().replace(/\n/g, '<br>')}</p>`;
            }
            break;
        }
        case 'withdrawal': {
            const data = formData as WithdrawalFormData;
            if (data.projectSummary.trim()) {
                generatedContent += `<h2>Project Summary</h2><p>${data.projectSummary.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.lessonsLearned.trim()) {
                generatedContent += `<h2>Lessons Learned</h2><p>${data.lessonsLearned.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.finalDeliverables.trim()) {
                generatedContent += `<h2>Final Deliverables</h2><p>${data.finalDeliverables.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.stakeholderFeedback.trim()) {
                generatedContent += `<h2>Stakeholder Feedback</h2><p>${data.stakeholderFeedback.trim().replace(/\n/g, '<br>')}</p>`;
            }
            if (data.futureRecommendations.trim()) {
                generatedContent += `<h2>Future Recommendations</h2><p>${data.futureRecommendations.trim().replace(/\n/g, '<br>')}</p>`;
            }
            break;
        }
    }

    // If no content was generated, provide a default message
    if (generatedContent === `<h1>${stepLabel} Document</h1>`) {
        generatedContent += `<p>Please fill in the form fields and click Generate to create your ${stepLabel.toLowerCase()} document.</p>`;
    }

    return generatedContent;
} 