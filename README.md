# SK Projects - Budget Management System

A comprehensive budget management system for Sangguniang Kabataan (SK) projects, featuring AI-powered PDF parsing and budget tracking.

## Features

- **AI-Powered PDF Parsing**: Upload PDF budget documents and automatically extract budget data using Google Gemini AI
- **Multiple File Format Support**: Upload PDF, CSV, or JSON files
- **Budget Tracking**: Monitor SK budget aligned with PPAs (Programs, Projects, Activities)
- **Committee Management**: Assign and track committee responsibilities
- **ABYIP Integration**: Align budget items with ABYIP (Annual Barangay Youth Investment Plan) activities
- **Document Generation**: Generate reports and documents
- **Modern UI**: Beautiful, responsive interface with dark mode support

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini AI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sk-final
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add your Google Gemini API key:
```bash
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

To get a Google Gemini API key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and paste it in your `.env.local` file

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Onboarding Process

1. **Upload Budget File**: 
   - **PDF Upload**: Upload PDF budget documents and AI will automatically extract and format the data
   - **CSV/JSON Upload**: Upload pre-formatted files with your budget data
   - Download the CSV template for reference

2. **Budget Format**: The system expects budget data with the following columns:
   - `category`: Budget category or PPA name (e.g., "PPA 1.1 - Infrastructure Development")
   - `amount`: Budget amount (numeric value)
   - `description`: Brief description (optional)
   - `committee_responsible`: Committee responsible (optional)
   - `committee_oversight`: Committee providing oversight (optional)
   - `abyip_ppa_activity`: ABYIP-aligned PPA/Activity name (optional)

### AI PDF Parsing

The system uses Google Gemini AI to automatically extract budget information from PDF documents:

- Upload any PDF containing budget information
- AI will identify PPA categories, amounts, and other relevant data
- Data is automatically formatted to match the required CSV structure
- Results are validated and stored for budget management

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── parse-pdf/          # PDF parsing API endpoint
│   ├── onboarding/             # Onboarding page with file upload
│   ├── budget/                 # Budget management pages
│   └── project/                # Project management pages
├── components/                 # Reusable UI components
└── lib/                        # Utility functions
```

## API Endpoints

- `POST /api/parse-pdf`: Parse PDF files using Google Gemini AI
  - Accepts multipart form data with PDF file
  - Returns CSV-formatted budget data

## Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI Integration**: Google Gemini AI (@google/generative-ai)
- **File Processing**: Built-in browser APIs for PDF/CSV handling
- **UI Components**: Lucide React icons, custom components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
