"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, CheckCircle2, Clock, DollarSign, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { Project } from '@/lib/types';
import { formatDate, getProjectProgress } from '@/lib/utils';
import { budgetManager } from '@/lib/budget';

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [budgetSummary, setBudgetSummary] = useState({
    total: 0,
    allocated: 0,
    available: 0,
    percentageUsed: 0
  });

  useEffect(() => {
    // Check onboarding status
    const isOnboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
    setOnboardingComplete(isOnboardingComplete);

    if (!isOnboardingComplete) {
      router.push('/onboarding');
      return;
    }

    // Load budget data
    budgetManager.loadProjectBudgets();
    setBudgetSummary(budgetManager.getBudgetSummary());
    
    setProjects(storage.getProjects());
  }, [router]);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.title.trim()) {
      const project = storage.createProject(newProject.title, newProject.description);
      setProjects([...projects, project]);
      setNewProject({ title: '', description: '' });
      setShowNewProjectForm(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 20) return 'text-yellow-600';
    return 'text-gray-400';
  };

  const getProgressBg = (progress: number) => {
    if (progress === 100) return 'bg-green-100';
    if (progress >= 60) return 'bg-blue-100';
    if (progress >= 20) return 'bg-yellow-100';
    return 'bg-gray-100';
  };

  if (!onboardingComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Redirecting to onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">SK Projects</h1>
              <p className="text-muted-foreground">Streamlined project management system</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                />
              </div>
              <Link href="/budget">
                <Button variant="outline" className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Budget</span>
                </Button>
              </Link>
              <Button
                onClick={() => setShowNewProjectForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Budget Overview Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <CardTitle>Budget Overview</CardTitle>
              </div>
              <Link href="/budget">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Budget
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-green-600">
                  ${budgetSummary.total.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Allocated</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${budgetSummary.allocated.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${budgetSummary.available.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Usage</p>
                <p className="text-2xl font-bold text-orange-600">
                  {budgetSummary.percentageUsed.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    budgetSummary.percentageUsed < 50 ? 'bg-green-500' :
                    budgetSummary.percentageUsed < 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(budgetSummary.percentageUsed, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Project Form */}
        {showNewProjectForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>Add a new SK project to get started with the 5-step workflow</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateProject}>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
                    Project Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    placeholder="Enter project title..."
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    placeholder="Project description..."
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewProjectForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Project</Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">No projects found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {projects.length === 0
                ? "Get started by creating your first SK project."
                : "Try adjusting your search terms."}
            </p>
            {projects.length === 0 && (
              <div className="mt-6">
                <Button onClick={() => setShowNewProjectForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first project
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const progress = getProjectProgress(project.completedSteps);
              return (
                <Link href={`/project/${project.id}`} key={project.id}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressBg(progress)} ${getProgressColor(progress)}`}>
                          {progress}%
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Progress Indicators */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">{project.completedSteps.length}/5 steps</span>
                      </div>
                      <div className="flex space-x-1 mb-4">
                        {(['planning', 'approval', 'resolution', 'dv', 'withdrawal'] as const).map((step) => (
                          <div
                            key={step}
                            className={`flex-1 h-2 rounded-full ${project.completedSteps.includes(step)
                              ? 'bg-green-500'
                              : 'bg-gray-200'
                              }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Updated {formatDate(project.lastModified)}</span>
                        </div>
                        {progress === 100 && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            <span>Complete</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
