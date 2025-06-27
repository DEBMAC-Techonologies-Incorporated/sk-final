// app/api/generate-document/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ProjectStep } from '@/lib/types';
import {
  generatePlanningDocument,
  generateApprovalDocument,
  generateResolutionDocument,
  generateDVDocument,
  generateWithdrawalDocument,
  PurchaseRequestFormData,
  ApprovalFormData,
  ResolutionFormData,
  DVFormData,
  WithdrawalFormData
} from '@/lib/generators';

type FormData =
  | PurchaseRequestFormData
  | ApprovalFormData
  | ResolutionFormData
  | DVFormData
  | WithdrawalFormData;

interface RequestBody {
  step: ProjectStep;
  formData: FormData;
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

    const { step, formData } = body;

    // Validate required fields
    if (!step || !formData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing step or form data.'
        },
        { status: 400 }
      );
    }

    console.log(`Attempting to generate document for step: ${step}`);

    // Generate document based on step type
    let text: string;
    try {
      switch (step) {
        case 'planning':
          text = await generatePlanningDocument(formData as PurchaseRequestFormData);
          break;
        case 'approval':
          text = await generateApprovalDocument(formData as ApprovalFormData);
          break;
        case 'resolution':
          text = await generateResolutionDocument(formData as ResolutionFormData);
          break;
        case 'dv':
          text = await generateDVDocument(formData as DVFormData);
          break;
        case 'withdrawal':
          text = await generateWithdrawalDocument(formData as WithdrawalFormData);
          break;
        default:
          return NextResponse.json(
            {
              success: false,
              error: `Unsupported step: ${step}`
            },
            { status: 400 }
          );
      }
    } catch (generationError: any) {
      console.error(`Error generating ${step} document:`, generationError);
      throw generationError; // Re-throw to be caught by outer try-catch
    }

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