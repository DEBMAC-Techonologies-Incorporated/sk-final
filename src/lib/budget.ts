export interface BudgetItem {
  category: string;
  amount: number;
  description?: string;
}

export interface BudgetData {
  totalBudget: number;
  items: BudgetItem[];
}

export interface ProjectBudget {
  projectId: string;
  allocatedAmount: number;
  category: string;
  description?: string;
}

export class BudgetManager {
  private static instance: BudgetManager;
  private budgetData: BudgetData | null = null;
  private projectBudgets: ProjectBudget[] = [];

  static getInstance(): BudgetManager {
    if (!BudgetManager.instance) {
      BudgetManager.instance = new BudgetManager();
    }
    return BudgetManager.instance;
  }

  loadBudgetData(): BudgetData | null {
    if (this.budgetData) return this.budgetData;
    
    try {
      const stored = localStorage.getItem('budgetData');
      if (stored) {
        this.budgetData = JSON.parse(stored);
        return this.budgetData;
      }
    } catch (error) {
      console.error('Failed to load budget data:', error);
    }
    return null;
  }

  saveBudgetData(data: BudgetData): void {
    this.budgetData = data;
    localStorage.setItem('budgetData', JSON.stringify(data));
  }

  getTotalBudget(): number {
    return this.budgetData?.totalBudget || 0;
  }

  getBudgetItems(): BudgetItem[] {
    return this.budgetData?.items || [];
  }

  getAvailableBudget(): number {
    const total = this.getTotalBudget();
    const allocated = this.projectBudgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0);
    return total - allocated;
  }

  getCategoryAvailableBudget(category: string): number {
    const categoryTotal = this.budgetData?.items.find(item => item.category === category)?.amount || 0;
    const categoryAllocated = this.projectBudgets
      .filter(budget => budget.category === category)
      .reduce((sum, budget) => sum + budget.allocatedAmount, 0);
    return categoryTotal - categoryAllocated;
  }

  allocateBudget(projectId: string, amount: number, category: string, description?: string): boolean {
    if (amount <= 0) return false;
    
    // Check if category has enough budget
    if (this.getCategoryAvailableBudget(category) < amount) {
      return false;
    }

    // Remove existing allocation for this project if any
    this.projectBudgets = this.projectBudgets.filter(budget => budget.projectId !== projectId);
    
    // Add new allocation
    this.projectBudgets.push({
      projectId,
      allocatedAmount: amount,
      category,
      description
    });

    this.saveProjectBudgets();
    return true;
  }

  getProjectBudget(projectId: string): ProjectBudget | null {
    return this.projectBudgets.find(budget => budget.projectId === projectId) || null;
  }

  removeProjectBudget(projectId: string): void {
    this.projectBudgets = this.projectBudgets.filter(budget => budget.projectId !== projectId);
    this.saveProjectBudgets();
  }

  private saveProjectBudgets(): void {
    localStorage.setItem('projectBudgets', JSON.stringify(this.projectBudgets));
  }

  loadProjectBudgets(): void {
    try {
      const stored = localStorage.getItem('projectBudgets');
      if (stored) {
        this.projectBudgets = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load project budgets:', error);
      this.projectBudgets = [];
    }
  }

  getBudgetSummary() {
    const total = this.getTotalBudget();
    const allocated = this.projectBudgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0);
    const available = Math.max(0, total - allocated); // Ensure available is never negative

    return {
      total,
      allocated,
      available,
      percentageUsed: total > 0 ? (allocated / total) * 100 : 0
    };
  }

  validateBudgetAllocation(amount: number, category: string): { valid: boolean; message?: string } {
    if (amount <= 0) {
      return { valid: false, message: 'Amount must be greater than 0' };
    }

    const available = this.getCategoryAvailableBudget(category);
    if (amount > available) {
      return { 
        valid: false, 
        message: `Insufficient budget in ${category}. Available: $${available.toLocaleString()}` 
      };
    }

    return { valid: true };
  }
}

export const budgetManager = BudgetManager.getInstance(); 