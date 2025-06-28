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
    console.log('API route called');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Request method:', request.method);
    
    // Check if the request has a body
    if (!request.body) {
      console.error('No request body found');
      return NextResponse.json({ error: 'No request body' }, { status: 400 });
    }
    
    let formData;
    try {
      formData = await request.formData();
      console.log('FormData parsed successfully');
    } catch (formDataError) {
      console.error('Error parsing FormData:', formDataError);
      
      // Try to get the raw body for debugging
      try {
        const rawBody = await request.text();
        console.log('Raw body (first 500 chars):', rawBody.substring(0, 500));
      } catch (textError) {
        console.error('Could not read raw body:', textError);
      }
      
      return NextResponse.json({ 
        error: 'Failed to parse body as FormData',
        details: formDataError instanceof Error ? formDataError.message : 'Unknown error'
      }, { status: 400 });
    }
    
    const file = formData.get('file') as File;
    console.log('File extracted from FormData:', file ? {
      name: file.name,
      type: file.type,
      size: file.size
    } : 'No file found');

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

### DOCUMENT STRUCTURE ###
- The document contains sections like "GENERAL ADMINISTRATION PROGRAM" and "YOUTH DEVELOPMENT AND EMPOWERMENT PROGRAM".
- Each section may have subcategories (e.g., "PERSONAL SERVICE", "MAINTENANCE AND OTHER OPERATING EXPENSES (MOOE)", "CAPITAL OUTLAY").
- Each budget item has an amount (e.g., "PHP 248,400.00" or "₱248,400.00"), a category, and a description (sometimes as a bulleted or indented line below the amount).
- Some items have a schedule/months (e.g., "June - December 2025").
- Some items are grouped under a main program/category.
- Committees and ABYIP activities may not be specified; leave those fields blank if not found.

### EXTRACTION RULES ###
1. **Category Identification**: Use the main program or subcategory as the category (e.g., "GENERAL ADMINISTRATION PROGRAM - PERSONAL SERVICE").
2. **Amount Processing**: 
   - Extract numeric values only (e.g., "PHP 50,000.00" or "₱50,000.00" → 50000)
   - Remove all currency symbols, commas, and spaces
   - Convert to integer format
3. **Description**: Use the indented or bulleted line(s) below the amount as the description. If not available, use the category name.
4. **Schedule**: If a schedule/months is present, append it to the description.
5. **Committee/ABYIP**: Leave blank if not specified.
6. **Data Validation**: Ensure each item has at least category and amount.

### ABYIP ACTIVITY MAPPING ###
- If ABYIP PPA Activity is not explicitly stated in the document, use the description as the ABYIP activity
- Format: "ABYIP - [Description]" (e.g., "ABYIP - Honorarium of SK Officials")
- If no description is available, use the category name as the ABYIP activity
- This ensures all budget items have a corresponding ABYIP activity for project allocation

### OUTPUT FORMAT ###
You MUST return ONLY a valid JSON object with this exact structure:
{
  "budgetItems": [
    {
      "category": "GENERAL ADMINISTRATION PROGRAM - PERSONAL SERVICE",
      "amount": 248400,
      "description": "Honorarium of SK Officials",
      "committee_responsible": "",
      "committee_oversight": "",
      "abyip_ppa_activity": ""
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
      // Improved fallback: extract PHP/₱ amounts, group by program/category, and use indented/bulleted lines as description
      const lines = responseText.split(/\r?\n/).map(l => l.trim());
      let currentProgram = '';
      let currentSubcategory = '';
      let lastAmount = null;
      let lastCategory = '';
      const lastDescription = '';
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Detect program/category headers
        if (/^(GENERAL ADMINISTRATION|YOUTH DEVELOPMENT|EMPOWERMENT PROGRAM|FINANCIAL ASSISTANCE|GRAND TOTAL|TOTAL)/i.test(line)) {
          currentProgram = line.replace(/^(TOTAL |GRAND TOTAL )/i, '').trim();
          currentSubcategory = '';
          continue;
        }
        // Detect subcategories
        if (/^(PERSONAL SERVICE|MAINTENANCE AND OTHER OPERATING EXPENSES|CAPITAL OUTLAY|EQUITABLE FOR ACCESS EDUCATION|ENVIRONMENT PROTECTION|CLIMATE CHANGE|HEALTH|ANTI-DRUG ABUSE PROGRAM|GENDER SENSITIVITY|SPORTS DEVELOPMENT|CAPABILITY BUILDING|YOUTH EMPOWERMENT|LINGGO NG KABATAAN|AGRICULTURE)/i.test(line)) {
          currentSubcategory = line;
          continue;
        }
        // Detect amount lines
        const amountMatch = line.match(/(?:PHP|₱)\s*([\d,.]+)/i);
        if (amountMatch) {
          lastAmount = parseFloat(amountMatch[1].replace(/[, ]/g, ''));
          lastCategory = currentProgram + (currentSubcategory ? ' - ' + currentSubcategory : '');
          // Look ahead for description (next non-empty, non-amount line)
          let description = '';
          for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
            const descLine = lines[j];
            if (descLine && !descLine.match(/(?:PHP|₱)\s*[\d,.]+/i) && !/^(MONTHS|SCHEDULE|TOTAL|PREPARED BY|APPROVED BY|Republic of the Philippines|City of Naga|Barangay|OFFICE OF THE SANGGUNIANG KABATAAN)/i.test(descLine)) {
              description = descLine;
              break;
            }
          }
          // Look ahead for schedule/months
          let schedule = '';
          for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
            const schedLine = lines[j];
            if (schedLine && schedLine.match(/(January|February|March|April|May|June|July|August|September|October|November|December|\d{4}|2025)/i)) {
              schedule = schedLine;
              break;
            }
          }
          if (schedule) description += (description ? ' ' : '') + '(' + schedule + ')';
          budgetItems.push({
            category: lastCategory,
            amount: lastAmount,
            description: description || lastCategory,
            committee_responsible: '',
            committee_oversight: '',
            abyip_ppa_activity: description ? `ABYIP - ${description}` : `ABYIP - ${lastCategory}`
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