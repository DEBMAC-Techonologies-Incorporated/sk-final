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
      const validation = budgetManager.validateBudgetAllocation(numValue, category);
      setValidation(validation);
    }
  };

  const handleCategoryChange = (selectedCategory: string) => {
    setCategory(selectedCategory);
    
    if (amount > 0) {
      const validation = budgetManager.validateBudgetAllocation(amount, selectedCategory);
      setValidation(validation);
    }
  };

  const handleAllocate = () => {
    if (!category || amount <= 0) {
      setValidation({ valid: false, message: 'Please select a category and enter a valid amount' });
      return;
    }

    const validation = budgetManager.validateBudgetAllocation(amount, category);
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-800 font-medium">No Budget Data</p>
            <p className="text-yellow-700 text-sm">
              Please complete the onboarding process to set up your budget first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const summary = budgetManager.getBudgetSummary();

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Budget Overview</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Budget</p>
            <p className="font-medium text-green-600">${summary.total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Allocated</p>
            <p className="font-medium text-blue-600">${summary.allocated.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Available</p>
            <p className="font-medium text-gray-900">${summary.available.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${summary.percentageUsed}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{summary.percentageUsed.toFixed(1)}% used</p>
        </div>
      </div>

      {/* Budget Allocation Form */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span>Project Budget Allocation</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Category
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isAllocated}
            >
              <option value="">Select a category</option>
              {budgetData.items.map((item) => {
                const available = budgetManager.getCategoryAvailableBudget(item.category);
                return (
                  <option key={item.category} value={item.category}>
                    {item.category} - ${available.toLocaleString()} available
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter amount"
              min="0"
              step="0.01"
              disabled={isAllocated}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe how this budget will be used..."
            rows={3}
            disabled={isAllocated}
          />
        </div>

        {/* Validation Message */}
        {validation && (
          <div className={`rounded-lg p-4 flex items-start space-x-3 ${
            validation.valid 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {validation.valid ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className={`font-medium ${
                validation.valid ? 'text-green-800' : 'text-red-800'
              }`}>
                {validation.valid ? 'Valid' : 'Error'}
              </p>
              <p className={`text-sm ${
                validation.valid ? 'text-green-700' : 'text-red-700'
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

      {/* Category Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Budget Categories</h4>
        <div className="space-y-2">
          {budgetData.items.map((item) => {
            const available = budgetManager.getCategoryAvailableBudget(item.category);
            const used = item.amount - available;
            const percentage = item.amount > 0 ? (used / item.amount) * 100 : 0;
            
            return (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.category}</p>
                  {item.description && (
                    <p className="text-gray-600 text-xs">{item.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-gray-900">${used.toLocaleString()} / ${item.amount.toLocaleString()}</p>
                  <p className="text-gray-600 text-xs">{percentage.toFixed(1)}% used</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 