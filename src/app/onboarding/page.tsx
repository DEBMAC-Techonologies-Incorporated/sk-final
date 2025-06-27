'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface BudgetItem {
  category: string;
  amount: number;
  description?: string;
}

interface BudgetData {
  totalBudget: number;
  items: BudgetItem[];
}

export default function OnboardingPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Check file type
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.json')) {
        throw new Error('Please upload a CSV, Excel, or JSON file');
      }

      // Read file content
      const text = await file.text();
      let parsedData: BudgetData;

      if (file.name.endsWith('.json')) {
        parsedData = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        parsedData = parseCSV(text);
      } else {
        // For Excel files, we'll need a library like xlsx
        throw new Error('Excel files are not supported yet. Please use CSV or JSON format.');
      }

      // Validate budget data
      validateBudgetData(parsedData);
      
      // Store in localStorage
      localStorage.setItem('budgetData', JSON.stringify(parsedData));
      localStorage.setItem('onboardingComplete', 'true');
      
      setBudgetData(parsedData);
      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsUploading(false);
    }
  };

  const parseCSV = (csvText: string): BudgetData => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Expected headers: category,amount,description (optional)
    if (!headers.includes('category') || !headers.includes('amount')) {
      throw new Error('CSV must have "category" and "amount" columns');
    }

    const categoryIndex = headers.indexOf('category');
    const amountIndex = headers.indexOf('amount');
    const descriptionIndex = headers.indexOf('description');

    const items: BudgetItem[] = [];
    let totalBudget = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const amount = parseFloat(values[amountIndex]);
      
      if (isNaN(amount)) {
        throw new Error(`Invalid amount in row ${i + 1}`);
      }

      const item: BudgetItem = {
        category: values[categoryIndex],
        amount: amount,
        description: descriptionIndex >= 0 ? values[descriptionIndex] : undefined
      };

      items.push(item);
      totalBudget += amount;
    }

    return { totalBudget, items };
  };

  const validateBudgetData = (data: BudgetData) => {
    if (!data.totalBudget || data.totalBudget <= 0) {
      throw new Error('Total budget must be greater than 0');
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('Budget must have at least one item');
    }

    const calculatedTotal = data.items.reduce((sum, item) => sum + item.amount, 0);
    if (Math.abs(calculatedTotal - data.totalBudget) > 0.01) {
      throw new Error(`Item amounts (${calculatedTotal}) don't match total budget (${data.totalBudget})`);
    }
  };

  const downloadTemplate = () => {
    // Use the actual template file
    const link = document.createElement('a');
    link.href = '/budget_template.csv';
    link.download = 'budget_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SK Projects</h1>
          <p className="text-gray-600">Let's set up your budget to get started</p>
        </div>

        {!success ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Budget Requirements</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Total budget amount</li>
                <li>• Itemized breakdown of budget categories</li>
                <li>• Optional descriptions for each category</li>
                <li>• Supported formats: CSV, JSON</li>
              </ul>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-4"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isUploading ? 'Processing...' : 'Upload Budget File'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Drag and drop or click to browse
                  </p>
                </div>
              </label>
            </div>

            <div className="text-center">
              <button
                onClick={downloadTemplate}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center mx-auto space-x-1"
              >
                <FileText className="w-4 h-4" />
                <span>Download CSV Template</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Upload Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Budget Uploaded Successfully!</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-600 mb-2">Budget Summary:</p>
              <p className="font-medium">Total Budget: ${budgetData?.totalBudget.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{budgetData?.items.length} categories</p>
            </div>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
} 