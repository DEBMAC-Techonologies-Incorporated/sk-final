'use client';

import { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { budgetManager } from '@/lib/budget';

interface BudgetDisplayProps {
  projectId?: string;
  compact?: boolean;
  showDetails?: boolean;
}

export default function BudgetDisplay({ projectId, compact = false, showDetails = true }: BudgetDisplayProps) {
  const [budgetStatus, setBudgetStatus] = useState<any>(null);
  const [projectBudget, setProjectBudget] = useState<any>(null);

  useEffect(() => {
    const status = budgetManager.getBudgetStatus();
    setBudgetStatus(status);
    
    if (projectId) {
      const projectBudgetData = budgetManager.getProjectBudget(projectId);
      setProjectBudget(projectBudgetData);
    }
  }, [projectId]);

  if (!budgetStatus) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
        <div className="flex items-center space-x-3">
          <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="text-yellow-800 font-medium dark:text-yellow-200">No Budget Data</p>
            <p className="text-yellow-700 text-sm dark:text-yellow-300">Complete onboarding to set up your budget</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      default: return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    }
  };

  if (compact) {
    return (
      <div className={`rounded-lg p-3 border ${getStatusBgColor(budgetStatus.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Budget</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${getStatusColor(budgetStatus.status)}`}>
              ${budgetStatus.available.toLocaleString()}
            </span>
            {getStatusIcon(budgetStatus.status)}
          </div>
        </div>
        {projectBudget && (
          <div className="mt-2 text-xs text-muted-foreground">
            Project: ${projectBudget.allocatedAmount.toLocaleString()} allocated
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 border ${getStatusBgColor(budgetStatus.status)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Budget Status</h3>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(budgetStatus.status)}
          <span className={`text-sm font-medium ${getStatusColor(budgetStatus.status)}`}>
            {budgetStatus.statusMessage}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
        <div>
          <p className="text-muted-foreground">Total</p>
          <p className="font-medium text-green-600">${budgetStatus.total.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Allocated</p>
          <p className="font-medium text-blue-600">${budgetStatus.allocated.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Available</p>
          <p className={`font-medium ${budgetStatus.available < 1000 ? 'text-red-600' : 'text-foreground'}`}>
            ${budgetStatus.available.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-3">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              budgetStatus.status === 'critical' ? 'bg-red-500' :
              budgetStatus.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(budgetStatus.percentageUsed, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{budgetStatus.percentageUsed.toFixed(1)}% used</span>
          <span>${budgetStatus.available.toLocaleString()} remaining</span>
        </div>
      </div>

      {projectBudget && (
        <div className="bg-muted rounded-lg p-3">
          <h4 className="font-medium text-foreground mb-2">Project Budget</h4>
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Allocated Amount</p>
              <p className="font-medium text-foreground">${projectBudget.allocatedAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium text-foreground">{projectBudget.category}</p>
            </div>
          </div>
          {projectBudget.description && (
            <p className="text-xs text-muted-foreground mt-2">{projectBudget.description}</p>
          )}
        </div>
      )}

      {showDetails && budgetStatus.available < 5000 && (
        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/20 dark:border-orange-800">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0 dark:text-orange-400" />
            <div>
              <p className="text-orange-800 font-medium text-sm dark:text-orange-200">Low Budget Warning</p>
              <p className="text-orange-700 text-xs dark:text-orange-300">
                Available budget is running low. Consider reviewing allocations or requesting additional funds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 