import BudgetDashboard from '@/components/budget/BudgetDashboard';

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage your project budgets across all categories
          </p>
        </div>
        
        <BudgetDashboard />
      </div>
    </div>
  );
} 