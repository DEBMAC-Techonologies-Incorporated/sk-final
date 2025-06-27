// app/api/generate-document/route.ts
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest, NextResponse } from 'next/server';

const systemPrompt = `You are an AI assistant responsible for generating official "Purchase Request Forms (PRF)" and corresponding "PR Authorization Forms" for SK Councils in the Philippines.
Follow these instructions precisely:

For the PRF:
- Clearly include the Activity Name.
- Provide a concise Activity Description.
- Specify Target Beneficiaries clearly.
- Create an Itemized Procurement List, indicating each item's quantity, description, and estimated unit and total price.
- State the total PR amount clearly.
- Mention the Committee Responsible.

For the PR Authorization Form:
- Clearly indicate the linked PR number and activity name.
- Include the name and role of the authorizing official (e.g., SK Chairperson or Bids & Awards Committee).
- Confirm budget availability per ABYIP clearly.

Strictly follow the official document formats. Your output must ONLY contain these two completed forms in proper HTML format with headings, tables, and proper structure suitable for a rich text editor.

Sample Document Formats for Reference:

## Purchase Request Form Template:
<h1>PURCHASE REQUEST FORM</h1>
<p><strong>Location:</strong> Barangay: ____________</p>
<p><strong>City/Municipality:</strong> BAYBAY CITY</p>
<p><strong>P.R. No.:</strong> ________________</p>
<p><strong>Date:</strong> ________________</p>

<h2>Requisition Details</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Item No.</th>
<th>Qty.</th>
<th>Unit of Measurement</th>
<th>Item Description</th>
<th>Estimated Unit Cost</th>
<th>Estimated Amount</th>
</tr>
</thead>
<tbody>
<tr><td>1</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>2</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>3</td><td></td><td></td><td></td><td></td><td></td></tr>
</tbody>
</table>

<p><strong>Total Estimated Amount:</strong> ________________</p>

<h2>Purpose</h2>
<p>_________________________________________________________________</p>
<p>_________________________________________________________________</p>

<h2>Approval Section</h2>
<p><strong>Requested by:</strong><br>
________________<br>
Requisitioner<br>
Date: _________________</p>

<p><strong>Approved:</strong><br>
___________________<br>
SK Chairperson<br>
Date: _________________</p>

## PR Authorization Form Template:
<h1>PURCHASE REQUEST AUTHORIZATION FORM</h1>
<p><strong>PR Authorization No.:</strong> ________________</p>
<p><strong>Date:</strong> ________________</p>
<p><strong>Barangay:</strong> ____________</p>
<p><strong>City/Municipality:</strong> BAYBAY CITY</p>

<h2>Purchase Request Reference</h2>
<p><strong>Related PR No.:</strong> ________________</p>
<p><strong>Activity Name:</strong> ________________</p>
<p><strong>Total Amount:</strong> ₱ ________________</p>

<h2>Authorization Details</h2>
<p><strong>Authorizing Official:</strong> ________________</p>
<p><strong>Position/Role:</strong> ________________</p>
<p><strong>Committee:</strong> ________________</p>

<h2>Budget Verification</h2>
<p><strong>ABYIP Allocation:</strong> ________________</p>
<p><strong>Available Budget:</strong> ₱ ________________</p>
<p><strong>Budget Availability Confirmed:</strong> □ Yes □ No</p>

<h2>Authorization</h2>
<p>I hereby authorize the procurement of the items listed in the referenced Purchase Request, subject to compliance with applicable procurement laws and regulations.</p>

<p><strong>Authorized by:</strong><br>
___________________<br>
Signature over Printed Name<br>
Position: ________________<br>
Date: _________________</p>

<p><strong>Witnessed by:</strong><br>
___________________<br>
Signature over Printed Name<br>
Position: ________________<br>
Date: _________________</p>`;

interface PurchaseItem {
  id: string;
  quantity: string;
  description: string;
  estimatedUnitPrice: string;
  estimatedTotalPrice: string;
}

interface RequestBody {
  selectedPPA: string;
  activityName: string;
  activityDescription: string;
  targetBeneficiaries: string;
  purchaseItems: PurchaseItem[];
  totalPRAmount: string;
  responsibleCommittee: string;
  relatedPR: string;
  authorizer: string;
  budgetAvailabilityConfirmed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
      return NextResponse.json(
        {
          success: false,
          error: 'API configuration error. Please check environment variables.'
        },
        { status: 500 }
      );
    }

    // Parse request body
    let body: RequestBody;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body.'
        },
        { status: 400 }
      );
    }

    const {
      selectedPPA,
      activityName,
      activityDescription,
      targetBeneficiaries,
      purchaseItems,
      totalPRAmount,
      responsibleCommittee,
      relatedPR,
      authorizer,
      budgetAvailabilityConfirmed
    } = body;

    // Validate required fields
    if (!selectedPPA || !activityName || !activityDescription || !targetBeneficiaries ||
        !responsibleCommittee || !relatedPR || !authorizer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields. Please fill in all required information.'
        },
        { status: 400 }
      );
    }

    // Validate purchase items
    if (!purchaseItems || !Array.isArray(purchaseItems) || purchaseItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one purchase item is required.'
        },
        { status: 400 }
      );
    }

    const validItems = purchaseItems.filter(item => item.description && item.description.trim());
    if (validItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one purchase item with a description is required.'
        },
        { status: 400 }
      );
    }

    // Prepare the user prompt with form data
    const userPrompt = `Generate a complete Purchase Request Form (PRF) and PR Authorization Form based on the following information:

**Purchase Request Information:**
- ABYIP-aligned PPA/Activity: ${selectedPPA}
- Activity Name: ${activityName}
- Activity Description: ${activityDescription}
- Target Beneficiaries/Participants: ${targetBeneficiaries}
- Committee Responsible for Oversight: ${responsibleCommittee}
- Total PR Amount: ₱${totalPRAmount}

**Itemized Purchase List:**
${validItems.map((item: PurchaseItem, index: number) =>
  `${index + 1}. Quantity: ${item.quantity || 'N/A'}, Description: ${item.description}, Unit Price: ₱${item.estimatedUnitPrice || '0.00'}, Total: ₱${item.estimatedTotalPrice || '0.00'}`
).join('\n')}

**PR Authorization Information:**
- Related Purchase Request: ${relatedPR}
- Authorizer: ${authorizer}
- Budget Availability Confirmed: ${budgetAvailabilityConfirmed ? 'Yes' : 'No'}

Generate both forms using proper HTML formatting with tables, headings, and structure. Fill in all the provided information appropriately in the forms. Use today's date (${new Date().toLocaleDateString('en-PH')}) where needed. Create professional, complete documents ready for official use.`;

    console.log('Attempting to generate document with Gemini...');

    // Generate the document using AI SDK with Gemini
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.2, // Lower temperature for more consistent official documents
      maxTokens: 65535,
    });

    console.log('Document generated successfully');

    return NextResponse.json({
      success: true,
      content: text
    });

  } catch (error: any) {
    console.error('Detailed error generating document:', error);

    // More specific error handling
    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid API key. Please check your Gemini API configuration.'
        },
        { status: 401 }
      );
    }

    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return NextResponse.json(
        {
          success: false,
          error: 'API quota exceeded. Please try again later.'
        },
        { status: 429 }
      );
    }

    if (error.message?.includes('model')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI model error. Please try again.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Failed to generate document: ${error.message || 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}

// Add other HTTP methods if needed
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'GET method not supported. Use POST to generate documents.'
    },
    { status: 405 }
  );
}