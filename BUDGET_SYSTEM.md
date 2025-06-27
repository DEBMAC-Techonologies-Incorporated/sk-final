# Budget Management System

## Overview

The SK Projects Management System now includes a comprehensive budget management system that enforces budget constraints during project creation and execution. This system ensures that project budgets are strictly followed and allocated from predefined budget categories.

## Features

### 1. Onboarding Process
- **First-time setup**: Users must complete onboarding before accessing the main application
- **Budget file upload**: Support for CSV and JSON file formats
- **Template download**: Pre-built CSV template for easy budget setup
- **Validation**: Automatic validation of budget data integrity

### 2. Budget Management
- **Total budget tracking**: Monitor overall budget allocation
- **Category-based allocation**: Allocate budgets from specific categories
- **Real-time validation**: Prevent over-allocation of budget categories
- **Visual indicators**: Progress bars and status indicators for budget usage

### 3. Project Integration
- **Step 1 enforcement**: Budget allocation required before proceeding with planning
- **Automatic inclusion**: Budget information automatically added to planning documents
- **Category tracking**: Track which budget category funds each project

## File Formats

### CSV Format
The system accepts CSV files with the following structure:
```csv
category,amount,description
Development,50000,Software development costs
Design,15000,UI/UX design work
Marketing,10000,Promotional activities
```

### JSON Format
The system also accepts JSON files with the following structure:
```json
{
  "totalBudget": 100000,
  "items": [
    {
      "category": "Development",
      "amount": 50000,
      "description": "Software development costs"
    },
    {
      "category": "Design",
      "amount": 15000,
      "description": "UI/UX design work"
    }
  ]
}
```

## Workflow

### 1. Onboarding
1. User visits the application for the first time
2. System redirects to `/onboarding`
3. User uploads budget file (CSV or JSON)
4. System validates budget data
5. Budget is stored in localStorage
6. User is redirected to main dashboard

### 2. Project Creation
1. User creates a new project
2. When accessing Step 1 (Planning), budget allocation is required
3. User must select a budget category and allocate an amount
4. System validates against available budget
5. Only after successful budget allocation can the planning document be generated

### 3. Budget Monitoring
1. Dashboard shows budget overview
2. Budget page provides detailed breakdown
3. Real-time updates as projects are created
4. Visual indicators for budget usage levels

## Budget Enforcement Rules

### Allocation Rules
- **Category limits**: Cannot allocate more than available in a category
- **Positive amounts**: All amounts must be greater than 0
- **Single allocation**: Each project can only be allocated from one category
- **Validation**: Real-time validation during allocation

### Project Requirements
- **Step 1 requirement**: Budget allocation is mandatory for planning step
- **Document inclusion**: Budget information is automatically included in planning documents
- **Tracking**: All allocations are tracked and can be viewed in budget dashboard

## Technical Implementation

### Storage
- **localStorage**: Budget data and project allocations stored locally
- **BudgetManager**: Singleton class for budget operations
- **Validation**: Built-in validation for all budget operations

### Components
- **BudgetAllocationForm**: Form component for project budget allocation
- **BudgetDashboard**: Dashboard component for budget overview
- **OnboardingPage**: Onboarding flow for initial budget setup

### Integration Points
- **Project creation**: Budget allocation integrated into step 1
- **Document generation**: Budget information included in planning documents
- **Dashboard**: Budget overview displayed on main dashboard

## Usage Examples

### Setting Up Budget
1. Download the template: `budget_template.csv`
2. Fill in your budget categories and amounts
3. Upload the file during onboarding
4. Verify the budget summary

### Creating a Project with Budget
1. Create a new project
2. Navigate to Step 1 (Planning)
3. Allocate budget from available categories
4. Fill in project details
5. Generate planning document (now includes budget info)

### Monitoring Budget Usage
1. View budget overview on dashboard
2. Check detailed breakdown on budget page
3. Monitor category usage and available amounts
4. Track project allocations

## Error Handling

### Common Issues
- **Insufficient budget**: System prevents allocation if category is over budget
- **Invalid file format**: Clear error messages for unsupported formats
- **Missing data**: Validation ensures all required fields are present
- **Calculation errors**: Automatic validation of total vs item amounts

### Validation Messages
- Clear, user-friendly error messages
- Real-time feedback during allocation
- Success confirmations for completed actions

## Future Enhancements

### Planned Features
- **Budget adjustments**: Ability to modify budget allocations
- **Multi-category allocation**: Allocate from multiple categories per project
- **Budget history**: Track changes and modifications over time
- **Export functionality**: Export budget reports and summaries
- **Advanced analytics**: Budget forecasting and trend analysis

### Technical Improvements
- **Database integration**: Move from localStorage to persistent storage
- **API endpoints**: RESTful API for budget operations
- **Real-time updates**: WebSocket integration for live updates
- **Advanced validation**: More sophisticated budget validation rules 