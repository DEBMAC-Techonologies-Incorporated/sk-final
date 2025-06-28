# PDF Parsing Prompt Optimization Guide

This guide explains how to improve the system prompt for better PDF parsing results using prompt engineering best practices.

## 📍 Where to Edit the Prompt

The prompt is located in: `src/app/api/parse-pdf/route.ts` (lines 25-75)

## 🚀 Current Improvements Made

Based on [prompt engineering best practices](https://www.promptingguide.ai/introduction/tips) and [system prompt design](https://leonnicholls.medium.com/building-the-ultimate-google-gemini-system-prompt-e3dab4e4cb2a), I've enhanced the prompt with:

### 1. **Clear Structure with Separators**
- Used `###` separators to organize different sections
- Clear hierarchy: SYSTEM ROLE → TASK → OUTPUT REQUIREMENTS → etc.

### 2. **Specificity and Detail**
- Added domain expertise (Philippine government budgeting)
- Detailed extraction rules for different data types
- Specific formatting instructions for amounts

### 3. **Step-by-Step Processing**
- Clear processing steps for the AI to follow
- Validation requirements
- Error handling guidelines

### 4. **Quality Standards**
- Defined accuracy, completeness, and consistency requirements
- Added validation checks

## 🎯 Further Optimization Strategies

### 1. **Add Few-Shot Examples**

You can add more examples to help the AI understand different document formats:

```typescript
### EXAMPLES ###
Example 1 - Standard PPA Format:
Input: "PPA 1.1 - Infrastructure Development\nAmount: ₱50,000.00"
Output: "PPA 1.1 - Infrastructure Development,50000,Infrastructure development projects,,,"

Example 2 - Committee Information:
Input: "PPA 2.1 - Education\nAmount: ₱25,000\nResponsible: Education Committee"
Output: "PPA 2.1 - Education,25000,Educational programs,Education Committee,,"

Example 3 - ABYIP Alignment:
Input: "PPA 3.1 - Health\nAmount: ₱15,000\nABYIP Activity: Health Awareness"
Output: "PPA 3.1 - Health,15000,Health programs,,,ABYIP 3.1 - Health Awareness"
```

### 2. **Add Context-Specific Instructions**

```typescript
### CONTEXT AWARENESS ###
- This is for Philippine Sangguniang Kabataan (SK) budgets
- PPA numbers typically follow format: 1.1, 1.2, 2.1, 2.2, etc.
- Common committees: Infrastructure, Education, Health, Youth Affairs, Environment
- Currency is Philippine Peso (₱)
- ABYIP activities should align with PPA numbers
```

### 3. **Enhanced Error Handling**

```typescript
### ERROR RECOVERY ###
- If PPA number is missing, infer from context or description
- If amount format is unclear, extract the largest numeric value
- If committee names are abbreviated, expand to full names
- If ABYIP reference is missing, create based on PPA category
```

### 4. **Add Validation Rules**

```typescript
### VALIDATION RULES ###
- All amounts must be positive integers
- PPA categories must contain a number (e.g., 1.1, 2.1)
- Committee names should be in Title Case
- Descriptions should be concise (max 100 characters)
- ABYIP activities should reference the corresponding PPA number
```

## 🔧 Advanced Prompt Techniques

### 1. **Chain-of-Thought Prompting**

Add reasoning steps to help the AI think through complex documents:

```typescript
### REASONING PROCESS ###
1. First, identify all budget-related sections in the document
2. For each section, determine if it contains PPA information
3. Extract the PPA number and category name
4. Find the corresponding amount and clean the format
5. Look for committee assignments in the same section
6. Identify ABYIP activities that correspond to the PPA
7. Validate that all required fields are present
```

### 2. **Role-Based Prompting**

```typescript
### EXPERT ROLE ###
You are a senior budget analyst with 15 years of experience in Philippine local government budgeting. You specialize in:
- SK budget analysis and interpretation
- PPA structure and categorization
- Committee assignment optimization
- ABYIP alignment and compliance
- Budget validation and quality assurance
```

### 3. **Output Format Control**

```typescript
### STRICT OUTPUT FORMAT ###
- Start with header row: category,amount,description,committee_responsible,committee_oversight,abyip_ppa_activity
- Each data row must have exactly 6 comma-separated values
- Empty fields should be represented by empty strings (no spaces)
- No quotes around values unless they contain commas
- No trailing commas
- No additional text, explanations, or markdown formatting
```

## 🧪 Testing and Iteration

### 1. **Create Test Cases**

Create different types of budget documents to test:

```typescript
// Test case 1: Well-formatted document
const testCase1 = `PPA 1.1 - Infrastructure
Amount: ₱50,000
Committee: Infrastructure`;

// Test case 2: Poorly formatted document
const testCase2 = `Budget Item 1: ₱25,000 for education programs`;

// Test case 3: Complex document with multiple sections
const testCase3 = `Section A: Infrastructure
- PPA 1.1: ₱30,000 for roads
- PPA 1.2: ₱20,000 for buildings`;
```

### 2. **A/B Testing**

Test different prompt versions:

```typescript
// Version A: Detailed instructions
const promptA = `Detailed step-by-step instructions...`;

// Version B: Example-focused
const promptB = `Multiple examples with different formats...`;

// Version C: Role-based
const promptC = `You are an expert budget analyst...`;
```

### 3. **Performance Metrics**

Track these metrics to evaluate prompt effectiveness:

- **Accuracy**: Percentage of correctly extracted amounts
- **Completeness**: Percentage of budget items found
- **Format Compliance**: Percentage of correctly formatted CSV rows
- **Processing Time**: Time taken to parse documents

## 🎨 Prompt Engineering Best Practices

Based on [promptingguide.ai](https://www.promptingguide.ai/introduction/tips):

### 1. **Start Simple**
- Begin with basic instructions
- Add complexity gradually
- Test each addition

### 2. **Be Specific**
- Use clear, unambiguous language
- Provide exact output formats
- Include specific examples

### 3. **Avoid Impreciseness**
- Don't say "keep it short" - say "use 2-3 sentences"
- Don't say "be professional" - say "use formal business language"

### 4. **Focus on What to Do**
- Instead of "don't include explanations"
- Say "return only the CSV data"

## 🔍 Troubleshooting Common Issues

### 1. **Inconsistent Amount Extraction**
```typescript
// Add specific amount processing rules
- Remove all non-numeric characters except decimal points
- Convert "₱50,000.00" to "50000"
- Handle different currency formats (₱, PHP, Peso)
```

### 2. **Missing PPA Categories**
```typescript
// Add pattern recognition
- Look for: "PPA", "Program", "Activity", "Project"
- Pattern: [Word] [Number].[Number] - [Description]
- Fallback: Extract from context or description
```

### 3. **Incorrect Committee Mapping**
```typescript
// Add committee name normalization
- "Infra Committee" → "Infrastructure Committee"
- "Educ Committee" → "Education Committee"
- "Health Comm" → "Health Committee"
```

## 📈 Continuous Improvement

### 1. **Collect Feedback**
- Monitor parsing accuracy
- Gather user feedback on results
- Track common failure patterns

### 2. **Iterate Prompt**
- Update based on real-world usage
- Add new examples for edge cases
- Refine instructions based on results

### 3. **Version Control**
- Keep track of prompt versions
- Document changes and their impact
- Rollback to previous versions if needed

## 🚀 Next Steps

1. **Test the current improved prompt** with your sample documents
2. **Add few-shot examples** for better accuracy
3. **Implement validation rules** for quality control
4. **Create test cases** for different document formats
5. **Monitor performance** and iterate based on results

Remember: Prompt engineering is an iterative process. Start with the current improvements, test thoroughly, and gradually add more sophisticated techniques based on your specific needs and results. 