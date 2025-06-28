# PDF Upload Feature Setup Guide

This guide will help you set up the AI-powered PDF parsing feature for the SK Projects budget management system.

## 🚀 What's Been Implemented

### 1. API Endpoint (`/api/parse-pdf`)
- **Location**: `src/app/api/parse-pdf/route.ts`
- **Function**: Processes PDF files using Google Gemini AI
- **Input**: Multipart form data with PDF file
- **Output**: CSV-formatted budget data

### 2. Updated Onboarding Page
- **Location**: `src/app/onboarding/page.tsx`
- **Features**:
  - PDF file upload support
  - AI-powered parsing with progress indicators
  - Fallback to CSV/JSON upload
  - Enhanced UI with file type indicators

### 3. Sample Files
- **Template**: `public/budget_template.csv`
- **Sample Budget**: `public/sample_budget.pdf.txt`

## 🔧 Setup Instructions

### Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Google Gemini AI API Key
GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
```

### Step 3: Install Dependencies

The required dependencies are already included in `package.json`:
- `@google/generative-ai`: Google Gemini AI SDK
- `@ai-sdk/google`: AI SDK for Google

### Step 4: Start the Development Server

```bash
npm run dev
```

## 📋 How It Works

### PDF Upload Process

1. **User Uploads PDF**: User selects a PDF file on the onboarding page
2. **File Validation**: System checks if the file is a valid PDF
3. **AI Processing**: PDF is sent to Google Gemini AI for parsing
4. **Data Extraction**: AI extracts budget information and converts to CSV format
5. **Validation**: Extracted data is validated against expected format
6. **Storage**: Valid data is stored in localStorage and user is redirected

### AI Prompt Structure

The system sends a detailed prompt to Gemini AI:

```
You are a financial document parser. Your task is to extract budget information from the provided PDF and convert it into a CSV format.

The CSV should have the following columns:
- category: The budget category or PPA (Program, Project, Activity) name
- amount: The budget amount (numeric value only)
- description: Brief description of the budget item (optional)
- committee_responsible: Committee responsible for this budget (optional)
- committee_oversight: Committee providing oversight (optional)
- abyip_ppa_activity: ABYIP-aligned PPA/Activity name (optional)
```

### Expected CSV Format

The AI should return data in this format:

```csv
category,amount,description,committee_responsible,committee_oversight,abyip_ppa_activity
PPA 1.1 - Infrastructure Development,50000,Community infrastructure projects,Infrastructure Committee,Executive Committee,ABYIP 1.1 - Community Center
PPA 1.2 - Capacity Building,15000,Training programs,Education Committee,Executive Committee,ABYIP 1.2 - Youth Leadership
```

## 🧪 Testing the Feature

### Method 1: Using the Web Interface

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/onboarding`
3. Upload a PDF file containing budget information
4. Watch the AI processing steps
5. Verify the extracted data

### Method 2: Using the Test Script

1. Install additional dependencies: `npm install form-data`
2. Run the test script: `node test-pdf-api.js`
3. Check the console output for results

### Method 3: Using cURL

```bash
curl -X POST \
  -F "file=@path/to/your/budget.pdf" \
  http://localhost:3000/api/parse-pdf
```

## 📊 Sample Budget Document

You can use the sample budget document at `public/sample_budget.pdf.txt` as a reference for the expected format. The AI should be able to extract:

- PPA categories (1.1, 1.2, 2.1, etc.)
- Budget amounts
- Descriptions
- Committee assignments
- ABYIP activities

## 🔍 Troubleshooting

### Common Issues

1. **API Key Not Set**
   - Error: "Failed to parse PDF"
   - Solution: Ensure `GOOGLE_GEMINI_API_KEY` is set in `.env.local`

2. **Invalid File Type**
   - Error: "File must be a PDF"
   - Solution: Upload only PDF files

3. **AI Parsing Errors**
   - Error: "Failed to extract data from PDF"
   - Solution: Check if the PDF contains readable text (not scanned images)

4. **CSV Format Issues**
   - Error: "CSV must have 'category' and 'amount' columns"
   - Solution: The AI might not have extracted data correctly. Try a different PDF format.

### Debug Mode

To enable debug logging, add this to your `.env.local`:

```bash
DEBUG=true
```

## 🎯 Best Practices

### For PDF Documents

1. **Use Text-Based PDFs**: Avoid scanned documents, use PDFs with selectable text
2. **Clear Structure**: Use consistent formatting for budget items
3. **Include Headers**: Make sure PPA categories are clearly labeled
4. **Standard Currency**: Use consistent currency format (₱ or PHP)

### For AI Prompting

1. **Be Specific**: The prompt includes detailed instructions for the AI
2. **Provide Examples**: The prompt includes sample output format
3. **Handle Edge Cases**: The system validates extracted data before storage

## 📈 Performance Considerations

- **File Size**: Large PDFs may take longer to process
- **API Limits**: Google Gemini has rate limits and usage quotas
- **Caching**: Consider implementing caching for frequently processed documents
- **Error Handling**: The system includes comprehensive error handling

## 🔮 Future Enhancements

Potential improvements for the PDF parsing feature:

1. **Multiple AI Models**: Support for different AI providers
2. **Batch Processing**: Process multiple PDFs at once
3. **Template Recognition**: Auto-detect different budget document formats
4. **OCR Support**: Handle scanned documents with OCR
5. **Export Options**: Export parsed data in different formats
6. **Validation Rules**: Custom validation rules for different budget types

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API key is correct
3. Test with the sample budget document
4. Check the network tab for API request/response details
5. Review the server logs for backend errors

---

**Note**: This feature requires an active internet connection and a valid Google Gemini API key to function properly. 