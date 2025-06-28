"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, CheckCircle2, Clock, DollarSign, Settings, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { Project } from '@/lib/types';
import { isOnboardingComplete, isBudgetSetupComplete, isLetterheadSetupComplete } from '@/lib/utils';
import { formatDate, getProjectProgress } from '@/lib/utils';
import { budgetManager } from '@/lib/budget';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

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

  const refreshBudgetSummary = () => {
    const budgetData = budgetManager.loadBudgetData();
    budgetManager.loadProjectBudgets();
    
    if (budgetData) {
      setBudgetSummary(budgetManager.getBudgetSummary());
    } else {
      setBudgetSummary({
        total: 0,
        allocated: 0,
        available: 0,
        percentageUsed: 0
      });
    }
  };

  useEffect(() => {
    // Check onboarding completion
    if (!isOnboardingComplete()) {
      if (!isBudgetSetupComplete()) {
        router.push('/onboarding');
        return;
      }
      if (!isLetterheadSetupComplete()) {
        router.push('/letterhead-setup');
        return;
      }
    }

    // Set onboarding complete if all checks pass
    setOnboardingComplete(true);

    // Load budget data in proper order
    refreshBudgetSummary();
    setProjects(storage.getProjects());
  }, [router]);

  // Refresh budget summary when component becomes visible (returning from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshBudgetSummary();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      // Remove budget allocation for this project
      budgetManager.removeProjectBudget(projectId);
      
      // Delete the project
      storage.deleteProject(projectId);
      
      // Update the projects list
      setProjects(storage.getProjects());
      
      // Refresh budget summary
      refreshBudgetSummary();
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
              <ThemeToggle />
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
              {/* Temporary Reset Button for Testing */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm('This will reset all data and redirect to onboarding. Continue?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
              >
                Reset All Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Centered Budget Overview */}
        <div className="mb-12">
          <div className="max-w-4xl mx-auto">
            {/* Main Budget Card - Centered and Prominent */}
            <Card className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-2 border-blue-100 shadow-2xl shadow-blue-100/50 hover:shadow-blue-200/50 transition-all duration-300">
              <CardContent className="p-12">
                <div className="text-center">
                  {/* Total Available Budget - Main Focus */}
                  <div className="mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wider">
                      Total Available Budget
                    </h2>
                    <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 mb-3">
                      ₱{budgetSummary.available.toLocaleString()}
                    </div>
                    <p className="text-blue-600 text-xl font-medium">
                      Ready to allocate
                    </p>
                  </div>

                  {/* Other Budget Figures - Below and Smaller */}
                  <div className="grid grid-cols-2 gap-12 max-w-lg mx-auto mb-8">
                    <div className="text-center p-4 bg-white/60 rounded-xl border border-blue-100 shadow-sm">
                      <div className="text-3xl font-bold text-gray-800 mb-1">
                        ₱{budgetSummary.total.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Total Budget</p>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-xl border border-blue-100 shadow-sm">
                      <div className="text-3xl font-bold text-gray-800 mb-1">
                        ₱{budgetSummary.allocated.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Allocated</p>
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="max-w-lg mx-auto">
                    <div className="flex justify-between text-sm text-gray-600 mb-3 font-medium">
                      <span>Budget Usage</span>
                      <span className="text-blue-700 font-semibold">{budgetSummary.percentageUsed.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden shadow-inner">
                      <div 
                        className={`h-5 rounded-full transition-all duration-700 ease-out shadow-sm ${
                          budgetSummary.percentageUsed < 50 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                          budgetSummary.percentageUsed < 80 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 
                          'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ width: `${Math.min(budgetSummary.percentageUsed, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-3 font-medium">
                      <span>₱{budgetSummary.allocated.toLocaleString()} used</span>
                      <span className="text-blue-600">₱{budgetSummary.available.toLocaleString()} remaining</span>
                    </div>
                  </div>

                  {/* Budget Status Alerts */}
                  {budgetSummary.percentageUsed >= 90 && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl max-w-lg mx-auto shadow-lg">
                      <div className="flex items-center justify-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-red-800 text-lg font-bold">Budget Critical</span>
                      </div>
                      <p className="text-red-700 text-sm text-center font-medium">
                        Budget nearly exhausted. Review allocations immediately.
                      </p>
                    </div>
                  )}
                  {budgetSummary.percentageUsed >= 75 && budgetSummary.percentageUsed < 90 && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl max-w-lg mx-auto shadow-lg">
                      <div className="flex items-center justify-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="text-amber-800 text-lg font-bold">Budget Warning</span>
                      </div>
                      <p className="text-amber-700 text-sm text-center font-medium">
                        Budget usage is high. Monitor allocations carefully.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Projects Section */}
        <div className="max-w-6xl mx-auto">
          {/* New Project Form */}
          {showNewProjectForm && (
            <Card className="mb-8 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 shadow-xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-800">Create New Project</CardTitle>
                <CardDescription className="text-gray-600">Add a new SK project to get started with the 5-step workflow</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateProject}>
                <CardContent className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      required
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white shadow-sm transition-all duration-200"
                      placeholder="Enter project title..."
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white shadow-sm transition-all duration-200 resize-none"
                      placeholder="Project description..."
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewProjectForm(false)}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
                    Create Project
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-8">
                {projects.length === 0
                  ? "Get started by creating your first SK project."
                  : "Try adjusting your search terms."}
              </p>
              {projects.length === 0 && (
                <Button 
                  onClick={() => setShowNewProjectForm(true)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create your first project
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => {
                const progress = getProjectProgress(project.completedSteps);
                return (
                  <Card key={project.id} className="hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50/50">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <Link href={`/project/${project.id}`} className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
                            {project.title}
                          </CardTitle>
                        </Link>
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
                            progress === 100 ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200' :
                            progress >= 60 ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200' :
                            progress >= 20 ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200' :
                            'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border border-gray-200'
                          }`}>
                            {progress}%
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2 text-gray-600 font-medium">
                        {project.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Progress Indicators */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-gray-800">{project.completedSteps.length}/5 steps</span>
                      </div>
                      <div className="flex space-x-1 mb-6">
                        {(['planning', 'approval', 'resolution', 'dv', 'withdrawal'] as const).map((step) => (
                          <div
                            key={step}
                            className={`flex-1 h-3 rounded-full shadow-sm ${
                              project.completedSteps.includes(step)
                                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium">Updated {formatDate(project.lastModified)}</span>
                        </div>
                        {progress === 100 && (
                          <div className="flex items-center text-emerald-600 font-semibold">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            <span>Complete</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
