// Test script for PDF parsing API
// Run with: node test-pdf-api.js

const fs = require('fs');
const FormData = require('form-data');

async function testPdfApi() {
  try {
    // Create a simple test PDF content (in real scenario, this would be a PDF file)
    const testContent = `SANGUNIANG KABATAAN BUDGET DOCUMENT

FISCAL YEAR 2024

BUDGET BREAKDOWN:

PPA 1.1 - Infrastructure Development
Amount: ₱50,000.00
Description: Community infrastructure projects and facilities improvement
Committee Responsible: Infrastructure Committee
Committee Oversight: Executive Committee
ABYIP PPA Activity: ABYIP 1.1 - Community Center Construction

PPA 1.2 - Capacity Building
Amount: ₱15,000.00
Description: Training programs and skill development initiatives
Committee Responsible: Education Committee
Committee Oversight: Executive Committee
ABYIP PPA Activity: ABYIP 1.2 - Youth Leadership Training

TOTAL BUDGET: ₱65,000.00`;

    // Create form data
    const formData = new FormData();
    formData.append('file', Buffer.from(testContent), {
      filename: 'test-budget.pdf',
      contentType: 'application/pdf'
    });

    // Make API request
    const response = await fetch('http://localhost:3000/api/parse-pdf', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response Success:', data.success);
      
      console.log('\n📊 Extracted CSV Data:');
      console.log(data.csvData);
      
      console.log('\n🔍 Structured Data:');
      if (data.structuredData && Array.isArray(data.structuredData)) {
        data.structuredData.forEach((item, index) => {
          console.log(`Item ${index + 1}:`);
          console.log(`  Category: ${item.category}`);
          console.log(`  Amount: ${item.amount}`);
          console.log(`  Description: ${item.description || 'N/A'}`);
          console.log(`  Committee Responsible: ${item.committee_responsible || 'N/A'}`);
          console.log(`  Committee Oversight: ${item.committee_oversight || 'N/A'}`);
          console.log(`  ABYIP PPA Activity: ${item.abyip_ppa_activity || 'N/A'}`);
          console.log('');
        });
        
        // Calculate total
        const total = data.structuredData.reduce((sum, item) => sum + item.amount, 0);
        console.log(`💰 Total Budget Extracted: ₱${total.toLocaleString()}`);
      }
    } else {
      const error = await response.text();
      console.error('❌ API Error:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Note: This test requires the server to be running and a valid Google Gemini API key
console.log('🧪 Testing PDF Parsing API with Structured Output...');
console.log('⚠️  Make sure the development server is running and GOOGLE_GEMINI_API_KEY is set');
testPdfApi(); 