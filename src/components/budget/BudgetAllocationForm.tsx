'use client';

import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { budgetManager, BudgetData, BudgetItem } from '@/lib/budget';

interface BudgetAllocationFormProps {
  projectId: string;
  onBudgetAllocated: (amount: number, category: string) => void;
  initialAmount?: number;
  initialCategory?: string;
}

export default function BudgetAllocationForm({
  projectId,
  onBudgetAllocated,
  initialAmount = 0,
  initialCategory = ''
}: BudgetAllocationFormProps) {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [amount, setAmount] = useState(initialAmount);
  const [category, setCategory] = useState(initialCategory);
  const [description, setDescription] = useState('');
  const [validation, setValidation] = useState<{ valid: boolean; message?: string } | null>(null);
  const [isAllocated, setIsAllocated] = useState(false);
  const [selectedOversight, setSelectedOversight] = useState('');
  const [selectedAbyip, setSelectedAbyip] = useState('');

  // Get unique oversight committees and ABYIP activities from budget data
  const oversightOptions = budgetData ? Array.from(new Set(budgetData.items.map(i => i.committee_oversight).filter(Boolean))) : [];
  const abyipOptions = budgetData ? Array.from(new Set(budgetData.items.map(i => i.abyip_ppa_activity).filter(Boolean))) : [];

  // When ABYIP activity is selected, auto-select the category and show available budget
  useEffect(() => {
    if (selectedAbyip && budgetData) {
      const item = budgetData.items.find(i => i.abyip_ppa_activity === selectedAbyip);
      if (item) {
        setCategory(item.category);
      }
    }
  }, [selectedAbyip, budgetData]);

  useEffect(() => {
    // Load budget data
    const data = budgetManager.loadBudgetData();
    if (data) {
      setBudgetData(data);
      budgetManager.loadProjectBudgets();
    }

    // Check if project already has budget allocated
    const existingBudget = budgetManager.getProjectBudget(projectId);
    if (existingBudget) {
      setAmount(existingBudget.allocatedAmount);
      setCategory(existingBudget.category);
      setDescription(existingBudget.description || '');
      setIsAllocated(true);
    }
  }, [projectId]);

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setAmount(numValue);
    
    if (category) {
      const validation = budgetManager.validateBudgetAllocation(numValue, category, projectId);
      setValidation(validation);
    }
  };

  const handleCategoryChange = (selectedCategory: string) => {
    setCategory(selectedCategory);
    
    if (amount > 0) {
      const validation = budgetManager.validateBudgetAllocation(amount, selectedCategory, projectId);
      setValidation(validation);
    }
  };

  const handleAllocate = () => {
    if (!category || amount <= 0) {
      setValidation({ valid: false, message: 'Please select a category and enter a valid amount' });
      return;
    }

    const validation = budgetManager.validateBudgetAllocation(amount, category, projectId);
    if (!validation.valid) {
      setValidation(validation);
      return;
    }

    const success = budgetManager.allocateBudget(projectId, amount, category, description);
    if (success) {
      setIsAllocated(true);
      onBudgetAllocated(amount, category);
      setValidation({ valid: true, message: 'Budget allocated successfully!' });
    } else {
      setValidation({ valid: false, message: 'Failed to allocate budget' });
    }
  };

  const handleUpdate = () => {
    handleAllocate();
  };

  if (!budgetData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0 dark:text-yellow-400" />
          <div>
            <p className="text-yellow-800 font-medium dark:text-yellow-200">No Budget Data</p>
            <p className="text-yellow-700 text-sm dark:text-yellow-300">
              Please complete the onboarding process to set up your budget first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const summary = budgetManager.getBudgetSummary();
  const budgetStatus = budgetManager.getBudgetStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      default: return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Budget Summary */}
      <div className={`rounded-lg p-4 border ${getStatusBgColor(budgetStatus.status)}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Budget Overview</h3>
          <div className={`text-sm font-medium ${getStatusColor(budgetStatus.status)}`}>
            {budgetStatus.statusMessage}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
          <div>
            <p className="text-muted-foreground">Total Budget</p>
            <p className="font-medium text-green-600">${summary.total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Allocated</p>
            <p className="font-medium text-blue-600">${summary.allocated.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Available</p>
            <p className={`font-medium ${summary.available < 1000 ? 'text-red-600' : 'text-foreground'}`}>
              ${summary.available.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                budgetStatus.status === 'critical' ? 'bg-red-500' :
                budgetStatus.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(summary.percentageUsed, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{summary.percentageUsed.toFixed(1)}% used</span>
            <span>${summary.available.toLocaleString()} remaining</span>
          </div>
        </div>
      </div>

      {/* Budget Allocation Form */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span>Project Budget Allocation</span>
        </h3>

        {/* ABYIP-aligned PPA/Activity Dropdown */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Select ABYIP-aligned PPA/Activity
          </label>
          <select
            value={selectedAbyip}
            onChange={e => setSelectedAbyip(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
            disabled={isAllocated}
          >
            <option value="">Select an activity</option>
            {abyipOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {selectedAbyip && budgetData && (
            <div className="mt-1 text-xs text-muted-foreground">
              Available Budget: $
              {(() => {
                const item = budgetData.items.find(i => i.abyip_ppa_activity === selectedAbyip);
                return item ? budgetManager.getCategoryAvailableBudget(item.category).toLocaleString() : '0';
              })()}
            </div>
          )}
        </div>

        {/* Committee Oversight Dropdown */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Committee Responsible for Oversight
          </label>
          <select
            value={selectedOversight}
            onChange={e => setSelectedOversight(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
            disabled={isAllocated}
          >
            <option value="">Select oversight committee</option>
            {oversightOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Budget Category (auto-selected by ABYIP) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Budget Category
          </label>
          <input
            type="text"
            value={category}
            readOnly
            className="w-full px-3 py-2 border border-input rounded-md bg-gray-100 dark:bg-gray-800 text-muted-foreground"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Amount ($)
          </label>
          <input
            type="number"
            value={amount || ''}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
            placeholder="Enter amount"
            min="0"
            step="0.01"
            disabled={isAllocated}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
            placeholder="Describe how this budget will be used..."
            rows={3}
            disabled={isAllocated}
          />
        </div>

        {/* Validation Message */}
        {validation && (
          <div className={`rounded-lg p-4 flex items-start space-x-3 ${
            validation.valid 
              ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            {validation.valid ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0 dark:text-red-400" />
            )}
            <div>
              <p className={`font-medium ${
                validation.valid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {validation.valid ? 'Valid' : 'Error'}
              </p>
              <p className={`text-sm ${
                validation.valid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {validation.message}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          {isAllocated ? (
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Update Allocation
            </button>
          ) : (
            <button
              onClick={handleAllocate}
              disabled={!category || amount <= 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Allocate Budget
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Category Breakdown */}
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-3">Budget Categories</h4>
        <div className="space-y-3">
          {budgetData.items.map((item) => {
            const categoryStatus = budgetManager.getCategoryStatus(item.category);
            const available = budgetManager.getCategoryAvailableBudget(item.category);
            const used = item.amount - available;
            const percentage = item.amount > 0 ? (used / item.amount) * 100 : 0;
            
            return (
              <div key={item.category} className={`border rounded-lg p-3 ${
                categoryStatus.status === 'critical' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                categoryStatus.status === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20' :
                'border-border'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-foreground">{item.category}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        categoryStatus.status === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        categoryStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {categoryStatus.status}
                      </span>
                    </div>
                    {item.committee_responsible && (
                      <p className="text-blue-600 text-xs font-medium">{item.committee_responsible}</p>
                    )}
                    {item.committee_oversight && (
                      <p className="text-purple-600 text-xs font-medium">Oversight: {item.committee_oversight}</p>
                    )}
                    {item.abyip_ppa_activity && (
                      <p className="text-pink-600 text-xs font-medium">ABYIP: {item.abyip_ppa_activity}</p>
                    )}
                    {item.description && (
                      <p className="text-muted-foreground text-xs">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">${used.toLocaleString()} / ${item.amount.toLocaleString()}</p>
                    <p className={`text-xs ${getStatusColor(categoryStatus.status)}`}>
                      {percentage.toFixed(1)}% used
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Available: ${available.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      categoryStatus.status === 'critical' ? 'bg-red-500' :
                      categoryStatus.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 