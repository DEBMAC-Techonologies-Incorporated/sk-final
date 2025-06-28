'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, DollarSign, AlertCircle, CheckCircle, File } from 'lucide-react';

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  description?: string;
  committee_responsible?: string;
  committee_oversight?: string;
  abyip_ppa_activity?: string;
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
  const [processingStep, setProcessingStep] = useState<string>('');
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setProcessingStep('');

    try {
      // Check file type
      if (file.type === 'application/pdf') {
        await handlePdfUpload(file);
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.json')) {
        await handleDirectFileUpload(file);
      } else {
        throw new Error('Please upload a PDF, CSV, Excel, or JSON file');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    setProcessingStep('Uploading PDF...');
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('File being uploaded:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    try {
      setProcessingStep('Analyzing PDF with AI...');
      console.log('Sending fetch request to /api/parse-pdf');
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to parse PDF');
      }

      setProcessingStep('Processing extracted data...');
      
      // Use structured data if available, otherwise fall back to CSV parsing
      let parsedData: BudgetData;
      
      if (data.structuredData && Array.isArray(data.structuredData)) {
        // Use the structured data directly
        const items: BudgetItem[] = data.structuredData.map((item: any) => ({
          id: crypto.randomUUID(),
          category: item.category,
          amount: item.amount,
          description: item.description,
          committee_responsible: item.committee_responsible,
          committee_oversight: item.committee_oversight,
          abyip_ppa_activity: item.abyip_ppa_activity
        }));
        
        const totalBudget = items.reduce((sum, item) => sum + item.amount, 0);
        parsedData = { totalBudget, items };
      } else {
        // Fallback to CSV parsing
        parsedData = parseCSV(data.csvData);
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
      
    } catch (error) {
      console.error('PDF upload error:', error);
      alert(`Error processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProcessingStep('');
    }
  };

  const handleDirectFileUpload = async (file: File) => {
    setProcessingStep('Processing file...');
    
    // Read file content
    const text = await file.text();
    let parsedData: BudgetData;

    if (file.name.endsWith('.json')) {
      parsedData = JSON.parse(text);
    } else if (file.name.endsWith('.csv')) {
      parsedData = parseCSV(text);
    } else {
      // For Excel files, we'll need a library like xlsx
      throw new Error('Excel files are not supported yet. Please use CSV, JSON, or PDF format.');
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
  };

  const parseCSV = (csvText: string): BudgetData => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Expected headers: category,amount,description (optional), committee_responsible (optional), committee_oversight (optional), abyip_ppa_activity (optional)
    if (!headers.includes('category') || !headers.includes('amount')) {
      throw new Error('CSV must have "category" and "amount" columns');
    }

    const categoryIndex = headers.indexOf('category');
    const amountIndex = headers.indexOf('amount');
    const descriptionIndex = headers.indexOf('description');
    const committeeIndex = headers.indexOf('committee_responsible');
    const committeeOversightIndex = headers.indexOf('committee_oversight');
    const abyipPpaActivityIndex = headers.indexOf('abyip_ppa_activity');

    const items: BudgetItem[] = [];
    let totalBudget = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const amount = parseFloat(values[amountIndex]);
      
      if (isNaN(amount)) {
        throw new Error(`Invalid amount in row ${i + 1}`);
      }

      const item: BudgetItem = {
        id: crypto.randomUUID(),
        category: values[categoryIndex],
        amount: amount,
        description: descriptionIndex >= 0 ? values[descriptionIndex] : undefined,
        committee_responsible: committeeIndex >= 0 ? values[committeeIndex] : undefined,
        committee_oversight: committeeOversightIndex >= 0 ? values[committeeOversightIndex] : undefined,
        abyip_ppa_activity: abyipPpaActivityIndex >= 0 ? values[abyipPpaActivityIndex] : undefined
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card rounded-2xl shadow-xl p-8 border border-border">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to SK Projects</h1>
          <p className="text-muted-foreground">Set up your Sangguniang Kabataan budget aligned with PPAs</p>
        </div>

        {!success ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">SK Budget Requirements</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Total budget amount aligned with SK PPAs</li>
                <li>• Itemized breakdown of budget categories (PPA 1.1, 1.2, 2.1, etc.)</li>
                <li>• Committee responsible for each budget cluster</li>
                <li>• Optional descriptions for each category</li>
                <li>• Supported formats: PDF, CSV, JSON</li>
                <li>• <strong>NEW:</strong> Upload PDF documents and AI will extract budget data automatically!</li>
              </ul>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.csv,.json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-4"
              >
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  ) : (
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    {isUploading ? 'Processing...' : 'Upload Budget File'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to browse
                  </p>
                  {processingStep && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {processingStep}
                    </p>
                  )}
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-2">
                  <File className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-green-900 dark:text-green-100">PDF Upload</h4>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Upload PDF budget documents and our AI will automatically extract and format the data
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">CSV/JSON Upload</h4>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Upload pre-formatted CSV or JSON files with your budget data
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={downloadTemplate}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center justify-center mx-auto space-x-1"
              >
                <FileText className="w-4 h-4" />
                <span>Download CSV Template</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 dark:bg-red-900/20 dark:border-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0 dark:text-red-400" />
                <div>
                  <p className="text-red-800 font-medium dark:text-red-200">Upload Error</p>
                  <p className="text-red-700 text-sm dark:text-red-300">{error}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Budget Uploaded Successfully!</h3>
            <div className="bg-muted rounded-lg p-4 text-left">
              <p className="text-sm text-muted-foreground mb-2">Budget Summary:</p>
              <p className="font-medium">Total Budget: ₱{budgetData?.totalBudget.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{budgetData?.items.length} PPA categories</p>
              {budgetData?.items.some(item => item.committee_responsible) && (
                <p className="text-sm text-muted-foreground mt-1">✓ Committee assignments included</p>
              )}
              {budgetData?.items.some(item => item.committee_oversight) && (
                <p className="text-sm text-muted-foreground mt-1">✓ Oversight assignments included</p>
              )}
              {budgetData?.items.some(item => item.abyip_ppa_activity) && (
                <p className="text-sm text-muted-foreground mt-1">✓ ABYIP-aligned PPA/Activity included</p>
              )}
            </div>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
} 