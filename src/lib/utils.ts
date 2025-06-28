import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function getProjectProgress(completedSteps: string[]): number {
    return Math.round((completedSteps.length / 5) * 100);
}

// Onboarding completion checks
export function isBudgetSetupComplete(): boolean {
    if (typeof window === 'undefined') return false;
    const budgetData = localStorage.getItem('budgetData');
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    return !!(budgetData && onboardingComplete);
}

export function isLetterheadSetupComplete(): boolean {
    if (typeof window === 'undefined') return false;
    const letterheadConfig = localStorage.getItem('letterheadConfig');
    const letterheadComplete = localStorage.getItem('letterheadSetupComplete');
    return !!(letterheadConfig && letterheadComplete);
}

export function isOnboardingComplete(): boolean {
    return isBudgetSetupComplete() && isLetterheadSetupComplete();
} 