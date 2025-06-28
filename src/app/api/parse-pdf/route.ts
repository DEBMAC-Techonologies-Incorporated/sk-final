import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// Define the structured output schema for budget items
const BudgetItemSchema = z.object({
  category: z.string().describe("Budget category or PPA name (e.g., 'PPA 1.1 - Infrastructure Development')"),
  amount: z.number().describe("Budget amount as numeric value only (remove ₱, PHP, commas, spaces)"),
  description: z.string().optional().describe("Brief description of the budget item"),
  committee_responsible: z.string().optional().describe("Committee responsible for implementation"),
  committee_oversight: z.string().optional().describe("Committee providing oversight"),
  abyip_ppa_activity: z.string().optional().describe("ABYIP-aligned PPA/Activity name")
});

const BudgetDataSchema = z.object({
  budgetItems: z.array(BudgetItemSchema).describe("Array of budget items extracted from the PDF")
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Convert PDF to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Create the prompt for Gemini with explicit JSON output instructions
    const prompt = `
You are an expert financial document parser specializing in Sangguniang Kabataan (SK) budget documents. Your expertise includes Philippine government budgeting, PPA (Program, Project, Activity) structures, and ABYIP (Annual Barangay Youth Investment Plan) alignment.

### TASK ###
Extract budget information from the provided PDF document and return it in a specific JSON format.

### EXTRACTION RULES ###
1. **PPA Identification**: Look for patterns like "PPA 1.1", "PPA 2.1", "Program 1.1", "Activity 1.1"
2. **Amount Processing**: 
   - Extract numeric values only (e.g., "₱50,000.00" → 50000)
   - Remove all currency symbols, commas, and spaces
   - Convert to integer format
3. **Committee Mapping**: Identify committees like "Infrastructure Committee", "Education Committee", "Health Committee"
4. **ABYIP Alignment**: Look for ABYIP references and align with corresponding PPA activities
5. **Data Validation**: Ensure each item has at least category and amount

### PROCESSING STEPS ###
1. Scan the entire PDF for budget-related information
2. Identify all PPA categories and their corresponding amounts
3. Extract descriptions and committee assignments where available
4. Map ABYIP activities to their corresponding PPAs
5. Format all data into the specified JSON structure
6. Validate that amounts are numeric and categories are properly labeled

### QUALITY STANDARDS ###
- **Accuracy**: Ensure extracted amounts match the source document exactly
- **Completeness**: Include all budget items found in the document
- **Consistency**: Use consistent formatting for PPA categories and committee names
- **Validation**: Verify that the total of individual amounts matches any stated total budget

### ERROR HANDLING ###
- If a field is not available in the document, leave it undefined
- If amounts are unclear or ambiguous, use the most reasonable interpretation
- If PPA categories are not clearly labeled, infer from context and descriptions

### OUTPUT FORMAT ###
You MUST return ONLY a valid JSON object with this exact structure:

{
  "budgetItems": [
    {
      "category": "PPA 1.1 - Infrastructure Development",
      "amount": 50000,
      "description": "Community infrastructure projects and facilities improvement",
      "committee_responsible": "Infrastructure Committee",
      "committee_oversight": "Executive Committee",
      "abyip_ppa_activity": "ABYIP 1.1 - Community Center Construction"
    }
  ]
}

### IMPORTANT ###
- Return ONLY the JSON object, no additional text, explanations, or markdown formatting
- Ensure the JSON is valid and properly formatted
- All amounts must be numbers (not strings)
- If a field is missing, omit it entirely (don't use null or empty strings)
`;

    // Get the Gemini model with generation configuration
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0, // Low temperature for consistent, deterministic output
        maxOutputTokens: 10000, // Limit output length for structured data
        topP: 0.8, // Control randomness in token selection
        topK: 40 // Limit token selection to top 40 most probable tokens
      }
    });

    // Generate content with structured output
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64
        }
      }
    ]);

    const response = await result.response;
    const responseText = response.text();
    
    console.log('Raw AI response:', responseText);
    
    // Parse the structured output
    let structuredData;
    try {
      // Try to extract JSON from the response
      let jsonText = responseText.trim();
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to parse as JSON
      structuredData = JSON.parse(jsonText);
      
      console.log('Parsed structured data:', structuredData);
      
    } catch (error) {
      console.warn('Failed to parse JSON, attempting text extraction:', error);
      
      // Fallback: try to extract budget items from text response
      const budgetItems = [];
      
      // Look for patterns like "PPA X.X - Description" and amounts
      const ppaPattern = /PPA\s+(\d+\.\d+)\s*-\s*([^,\n]+)/gi;
      const amountPattern = /₱?([\d,]+\.?\d*)/g;
      
      let match;
      while ((match = ppaPattern.exec(responseText)) !== null) {
        const category = match[0].trim();
        
        // Look for amount near this PPA
        const afterMatch = responseText.substring(match.index + match[0].length);
        const amountMatch = afterMatch.match(/₱?([\d,]+\.?\d*)/);
        const amount = amountMatch ? parseInt(amountMatch[1].replace(/[,₱]/g, '')) : 0;
        
        if (amount > 0) {
          budgetItems.push({
            category,
            amount,
            description: '',
            committee_responsible: '',
            committee_oversight: '',
            abyip_ppa_activity: ''
          });
        }
      }
      
      structuredData = { budgetItems };
      console.log('Fallback extracted data:', structuredData);
    }

    // Validate the structured data
    let validatedData;
    try {
      validatedData = BudgetDataSchema.parse(structuredData);
      console.log('Validation successful:', validatedData);
    } catch (validationError) {
      console.error('Validation failed:', validationError);
      
      // If validation fails, create a minimal valid structure
      const fallbackItems = structuredData?.budgetItems || [];
      if (fallbackItems.length === 0) {
        // Create a single fallback item if no items were extracted
        fallbackItems.push({
          category: "PPA 1.1 - Budget Item",
          amount: 0,
          description: "Extracted from PDF",
          committee_responsible: "",
          committee_oversight: "",
          abyip_ppa_activity: ""
        });
      }
      
      validatedData = { budgetItems: fallbackItems };
    }
    
    // Convert to CSV format
    const csvHeader = 'category,amount,description,committee_responsible,committee_oversight,abyip_ppa_activity';
    const csvRows = validatedData.budgetItems.map((item: any) => 
      `${item.category},${item.amount},${item.description || ''},${item.committee_responsible || ''},${item.committee_oversight || ''},${item.abyip_ppa_activity || ''}`
    );
    
    const csvData = [csvHeader, ...csvRows].join('\n');

    return NextResponse.json({ 
      success: true, 
      csvData,
      structuredData: validatedData.budgetItems
    });

  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF' }, 
      { status: 500 }
    );
  }
} 