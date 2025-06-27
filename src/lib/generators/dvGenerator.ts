import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { DVFormData } from '@/components/project/steps';

const systemPrompt = `You are an AI assistant responsible for generating official "Design Verification and Testing Documents" for SK Councils in the Philippines.
Follow these instructions precisely:

For Design Verification Documents:
- Create comprehensive testing strategies and validation procedures
- Define validation criteria and acceptance standards
- Detail test scenarios, cases, and edge conditions
- Establish quality assurance processes and review protocols
- Specify performance metrics and KPIs for success measurement

Your output must be in proper HTML format with headings, tables, sections, and professional structure suitable for a rich text editor.

Sample Document Format for Reference:

## Design Verification Document Template:
<h1>DESIGN VERIFICATION & TESTING PLAN</h1>
<p><strong>Document No.:</strong> ________________</p>
<p><strong>Date:</strong> ________________</p>
<p><strong>Barangay:</strong> ____________</p>
<p><strong>City/Municipality:</strong> BAYBAY CITY</p>

<h2>Project Information</h2>
<p><strong>Project Title:</strong> ________________</p>
<p><strong>Testing Phase:</strong> ________________</p>
<p><strong>Testing Period:</strong> ________________</p>

<h2>Test Plan & Strategy</h2>
<h3>Testing Methodology</h3>
<p>________________</p>

<h3>Testing Scope</h3>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Test Area</th>
<th>Scope</th>
<th>Priority</th>
</tr>
</thead>
<tbody>
<tr><td>Functional Testing</td><td></td><td>High</td></tr>
<tr><td>Performance Testing</td><td></td><td>Medium</td></tr>
<tr><td>Security Testing</td><td></td><td>High</td></tr>
</tbody>
</table>

<h2>Validation Criteria</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Criteria</th>
<th>Expected Result</th>
<th>Pass/Fail Threshold</th>
</tr>
</thead>
<tbody>
<tr><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td></tr>
</tbody>
</table>

<h2>Test Scenarios & Cases</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Test Case ID</th>
<th>Description</th>
<th>Expected Outcome</th>
<th>Status</th>
</tr>
</thead>
<tbody>
<tr><td>TC-001</td><td></td><td></td><td>Pending</td></tr>
<tr><td>TC-002</td><td></td><td></td><td>Pending</td></tr>
<tr><td>TC-003</td><td></td><td></td><td>Pending</td></tr>
</tbody>
</table>

<h2>Quality Assurance Process</h2>
<h3>QA Procedures</h3>
<p>________________</p>

<h3>Review Checkpoints</h3>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Checkpoint</th>
<th>Reviewer</th>
<th>Criteria</th>
</tr>
</thead>
<tbody>
<tr><td>Initial Review</td><td></td><td></td></tr>
<tr><td>Mid-point Review</td><td></td><td></td></tr>
<tr><td>Final Review</td><td></td><td></td></tr>
</tbody>
</table>

<h2>Performance Metrics & KPIs</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Metric</th>
<th>Target Value</th>
<th>Measurement Method</th>
</tr>
</thead>
<tbody>
<tr><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td></tr>
</tbody>
</table>

<h2>Test Results Summary</h2>
<p><strong>Overall Test Status:</strong> ________________</p>
<p><strong>Pass Rate:</strong> ________________</p>
<p><strong>Critical Issues:</strong> ________________</p>

<h2>Approval</h2>
<p><strong>QA Lead:</strong><br>
___________________<br>
Signature & Date</p>

<p><strong>Project Manager:</strong><br>
___________________<br>
Signature & Date</p>`;

export async function generateDVDocument(formData: DVFormData): Promise<string> {
    const {
        testPlan,
        validationCriteria,
        testScenarios,
        qualityAssurance,
        performanceMetrics
    } = formData;

    const userPrompt = `Generate a complete Design Verification and Testing Document based on the following information:

**Test Plan & Strategy:**
${testPlan}

**Validation Criteria:**
${validationCriteria}

**Test Scenarios & Cases:**
${testScenarios}

**Quality Assurance Process:**
${qualityAssurance}

**Performance Metrics & KPIs:**
${performanceMetrics}

Generate a comprehensive testing and validation document using proper HTML formatting with tables, headings, and structure. Include detailed test plans, validation criteria, test scenarios, QA procedures, and performance metrics. Use today's date (${new Date().toLocaleDateString('en-PH')}) where needed. Create a professional document ready for design verification and testing implementation.`;

    const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.2,
        maxTokens: 65535,
    });

    return text;
} 