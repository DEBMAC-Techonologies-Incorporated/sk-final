export type ProjectStep = 'planning' | 'approval' | 'resolution' | 'dv' | 'withdrawal';

export interface StepDocument {
    content: string;
    lastModified: Date;
    isCompleted: boolean;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    lastModified: Date;
    documents: Record<ProjectStep, StepDocument>;
    completedSteps: ProjectStep[];
}

export interface ProjectFormData {
    title: string;
    description: string;
}

export const PROJECT_STEPS: { key: ProjectStep; label: string; description: string }[] = [
    {
        key: 'planning',
        label: 'Planning',
        description: 'Initial project scope, requirements, and strategy documentation'
    },
    {
        key: 'approval',
        label: 'Approval',
        description: 'Stakeholder review, sign-offs, and authorization documents'
    },
    {
        key: 'resolution',
        label: 'Resolution',
        description: 'Implementation details, technical solutions, and execution plans'
    },
    {
        key: 'dv',
        label: 'Design Verification',
        description: 'Testing, validation, and quality assurance documentation'
    },
    {
        key: 'withdrawal',
        label: 'Withdrawal',
        description: 'Project closure, lessons learned, and final reports'
    }
]; 