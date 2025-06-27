import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { ResolutionFormData } from '@/components/project/steps';

const systemPrompt = `You are an AI assistant responsible for generating official "Technical Resolution and Implementation Documents" for SK Councils in the Philippines.
Follow these instructions precisely:

For Resolution Documents:
- Detail comprehensive technical solutions and approaches
- Create detailed implementation plans with phases and timelines
- Specify resource allocation and team assignments
- Define key deliverables and completion criteria
- Establish quality standards and success metrics

Your output must be in proper HTML format with headings, tables, sections, and professional structure suitable for a rich text editor.

Sample Document Format for Reference:

## Technical Resolution Document Template:
<h1>TECHNICAL RESOLUTION & IMPLEMENTATION PLAN</h1>
<p><strong>Document No.:</strong> ________________</p>
<p><strong>Date:</strong> ________________</p>
<p><strong>Barangay:</strong> ____________</p>
<p><strong>City/Municipality:</strong> BAYBAY CITY</p>

<h2>Project Overview</h2>
<p><strong>Project Title:</strong> ________________</p>
<p><strong>Project Scope:</strong> ________________</p>
<p><strong>Expected Duration:</strong> ________________</p>

<h2>Technical Solution</h2>
<h3>Approach & Methodology</h3>
<p>________________</p>

<h3>Technical Requirements</h3>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Requirement</th>
<th>Specification</th>
<th>Priority</th>
</tr>
</thead>
<tbody>
<tr><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td></tr>
</tbody>
</table>

<h2>Implementation Plan</h2>
<h3>Project Phases</h3>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Phase</th>
<th>Activities</th>
<th>Duration</th>
<th>Resources</th>
</tr>
</thead>
<tbody>
<tr><td>Phase 1</td><td></td><td></td><td></td></tr>
<tr><td>Phase 2</td><td></td><td></td><td></td></tr>
<tr><td>Phase 3</td><td></td><td></td><td></td></tr>
</tbody>
</table>

<h2>Resource Allocation</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Resource Type</th>
<th>Allocation</th>
<th>Responsible Party</th>
</tr>
</thead>
<tbody>
<tr><td>Human Resources</td><td></td><td></td></tr>
<tr><td>Equipment</td><td></td><td></td></tr>
<tr><td>Budget</td><td></td><td></td></tr>
</tbody>
</table>

<h2>Key Deliverables</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Deliverable</th>
<th>Due Date</th>
<th>Success Criteria</th>
</tr>
</thead>
<tbody>
<tr><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td></tr>
</tbody>
</table>

<h2>Quality Standards</h2>
<p><strong>Quality Metrics:</strong> ________________</p>
<p><strong>Acceptance Criteria:</strong> ________________</p>
<p><strong>Review Process:</strong> ________________</p>

<h2>Approval</h2>
<p><strong>Technical Lead:</strong><br>
___________________<br>
Signature & Date</p>

<p><strong>Project Manager:</strong><br>
___________________<br>
Signature & Date</p>`;

export async function generateResolutionDocument(formData: ResolutionFormData): Promise<string> {
    const {
        technicalSolution,
        implementationPlan,
        resourceAllocation,
        deliverables,
        qualityStandards
    } = formData;

    const userPrompt = `Generate a complete Technical Resolution and Implementation Document based on the following information:

**Technical Solution:**
${technicalSolution}

**Implementation Plan:**
${implementationPlan}

**Resource Allocation:**
${resourceAllocation}

**Key Deliverables:**
${deliverables}

**Quality Standards & Metrics:**
${qualityStandards}

Generate a comprehensive technical document using proper HTML formatting with tables, headings, and structure. Include detailed technical specifications, implementation phases, resource requirements, deliverable schedules, and quality assurance measures. Use today's date (${new Date().toLocaleDateString('en-PH')}) where needed. Create a professional document ready for technical implementation.`;

    const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.2,
        maxTokens: 65535,
    });

    return text;
} 