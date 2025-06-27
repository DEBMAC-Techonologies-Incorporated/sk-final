import BudgetDashboard from '@/components/budget/BudgetDashboard';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budget Management</h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage your SK project budgets across all PPA categories
            </p>
          </div>
          <ThemeToggle />
        </div>
        
        <BudgetDashboard />
      </div>
    </div>
  );
} 