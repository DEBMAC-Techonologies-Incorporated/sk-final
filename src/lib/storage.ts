import { Project, ProjectStep, StepDocument } from './types';

const STORAGE_KEY = 'sk-projects';

// Create default step document
const createDefaultStepDocument = (): StepDocument => ({
    content: '',
    lastModified: new Date(),
    isCompleted: false,
});

// Create default project
export const createDefaultProject = (title: string, description: string): Project => ({
    id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    description,
    createdAt: new Date(),
    lastModified: new Date(),
    documents: {
        planning: createDefaultStepDocument(),
        approval: createDefaultStepDocument(),
        resolution: createDefaultStepDocument(),
        dv: createDefaultStepDocument(),
        withdrawal: createDefaultStepDocument(),
    },
    completedSteps: [],
});

// Storage utilities
export const storage = {
    // Get all projects
    getProjects: (): Project[] => {
        if (typeof window === 'undefined') return [];

        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];

            const projects = JSON.parse(data) as Array<Omit<Project, 'createdAt' | 'lastModified' | 'documents'> & {
                createdAt: string;
                lastModified: string;
                documents: Record<ProjectStep, Omit<StepDocument, 'lastModified'> & { lastModified: string }>;
            }>;

            // Convert date strings back to Date objects
            return projects.map((project) => ({
                ...project,
                createdAt: new Date(project.createdAt),
                lastModified: new Date(project.lastModified),
                documents: Object.fromEntries(
                    Object.entries(project.documents).map(([key, doc]) => [
                        key,
                        {
                            ...doc,
                            lastModified: new Date(doc.lastModified),
                        },
                    ])
                ) as Record<ProjectStep, StepDocument>,
            }));
        } catch (error) {
            console.error('Error loading projects:', error);
            return [];
        }
    },

    // Save all projects
    saveProjects: (projects: Project[]): void => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        } catch (error) {
            console.error('Error saving projects:', error);
        }
    },

    // Get single project by ID
    getProject: (id: string): Project | null => {
        const projects = storage.getProjects();
        return projects.find(p => p.id === id) || null;
    },

    // Create new project
    createProject: (title: string, description: string): Project => {
        const projects = storage.getProjects();
        const newProject = createDefaultProject(title, description);

        projects.push(newProject);
        storage.saveProjects(projects);

        return newProject;
    },

    // Update project
    updateProject: (updatedProject: Project): void => {
        const projects = storage.getProjects();
        const index = projects.findIndex(p => p.id === updatedProject.id);

        if (index !== -1) {
            projects[index] = { ...updatedProject, lastModified: new Date() };
            storage.saveProjects(projects);
        }
    },

    // Update step document
    updateStepDocument: (projectId: string, step: ProjectStep, content: string): void => {
        const project = storage.getProject(projectId);
        if (!project) return;

        project.documents[step] = {
            ...project.documents[step],
            content,
            lastModified: new Date(),
        };

        storage.updateProject(project);
    },

    // Toggle step completion
    toggleStepCompletion: (projectId: string, step: ProjectStep): void => {
        const project = storage.getProject(projectId);
        if (!project) return;

        const isCompleted = project.documents[step].isCompleted;
        project.documents[step].isCompleted = !isCompleted;

        // Update completed steps array
        if (!isCompleted) {
            if (!project.completedSteps.includes(step)) {
                project.completedSteps.push(step);
            }
        } else {
            project.completedSteps = project.completedSteps.filter(s => s !== step);
        }

        storage.updateProject(project);
    },

    // Delete project
    deleteProject: (id: string): void => {
        const projects = storage.getProjects();
        const filteredProjects = projects.filter(p => p.id !== id);
        storage.saveProjects(filteredProjects);
    },
}; 