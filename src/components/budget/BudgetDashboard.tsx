'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';
import { budgetManager, BudgetData } from '@/lib/budget';

export default function BudgetDashboard() {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [summary, setSummary] = useState({
    total: 0,
    allocated: 0,
    available: 0,
    percentageUsed: 0
  });

  const refreshBudgetData = () => {
    const data = budgetManager.loadBudgetData();
    if (data) {
      setBudgetData(data);
      budgetManager.loadProjectBudgets();
      setSummary(budgetManager.getBudgetSummary());
    }
  };

  useEffect(() => {
    refreshBudgetData();
  }, []);

  if (!budgetData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="text-yellow-800 font-medium dark:text-yellow-200">No Budget Data</p>
            <p className="text-yellow-700 text-sm dark:text-yellow-300">Complete onboarding to set up your budget</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage < 50) return <TrendingUp className="w-4 h-4" />;
    if (percentage < 80) return <BarChart3 className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Main Budget Overview */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <span>Budget Overview</span>
          </h2>
          <div className={`flex items-center space-x-2 ${getStatusColor(summary.percentageUsed)}`}>
            {getStatusIcon(summary.percentageUsed)}
            <span className="text-sm font-medium">
              {summary.percentageUsed.toFixed(1)}% Used
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-green-600">
              ₱{summary.total.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Allocated</p>
            <p className="text-2xl font-bold text-blue-600">
              ₱{summary.allocated.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Available</p>
            <p className="text-2xl font-bold text-foreground">
              ₱{summary.available.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Budget Usage</span>
            <span>{summary.allocated.toLocaleString()} / {summary.total.toLocaleString()}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                summary.percentageUsed < 50 ? 'bg-green-500' :
                summary.percentageUsed < 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          <span>Budget Categories</span>
        </h3>
        <div className="space-y-4">
          {budgetData.items.map((item) => {
            const allocations = budgetManager.getAllocationsForItem(item.id);
            const used = allocations.reduce((sum: number, alloc: { allocatedAmount: number }) => sum + alloc.allocatedAmount, 0);
            const available = item.amount - used;
            const percentage = item.amount > 0 ? (used / item.amount) * 100 : 0;
            return (
              <div key={item.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">{item.category}</h4>
                    {item.committee_responsible && (
                      <p className="text-blue-600 text-sm font-medium">{item.committee_responsible}</p>
                    )}
                    {item.committee_oversight && (
                      <p className="text-purple-600 text-xs font-medium">Oversight: {item.committee_oversight}</p>
                    )}
                    {item.abyip_ppa_activity && (
                      <p className="text-pink-600 text-xs font-medium">ABYIP: {item.abyip_ppa_activity}</p>
                    )}
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      ₱{used.toLocaleString()} / ₱{item.amount.toLocaleString()}
                    </p>
                    <p className={`text-sm ${getStatusColor(percentage)}`}>
                      {percentage.toFixed(1)}% used
                    </p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      percentage < 50 ? 'bg-green-500' :
                      percentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Available: ₱{available.toLocaleString()}</span>
                  <span>Used: ₱{used.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <DollarSign className="w-4 h-4" />
            <span>View All Projects</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            <TrendingUp className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>
      {/* Example: <BudgetAllocationForm onBudgetChange={refreshBudgetData} ... /> */}
    </div>
  );
}
