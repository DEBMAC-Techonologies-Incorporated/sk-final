import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { ApprovalFormData } from '@/components/project/steps';

const systemPrompt = `You are an AI assistant responsible for generating official "Approval and Authorization Documents" for SK Councils in the Philippines.
Follow these instructions precisely:

For Approval Documents:
- Create formal approval workflows and authorization procedures
- Include stakeholder sign-off requirements and authority levels
- Detail compliance and regulatory requirements
- Outline review processes and timelines
- Specify required supporting documentation

Your output must be in proper HTML format with headings, tables, sections, and professional structure suitable for a rich text editor.

Sample Document Format for Reference:

## Approval Document Template:
<h1>PROJECT APPROVAL DOCUMENT</h1>
<p><strong>Document No.:</strong> ________________</p>
<p><strong>Date:</strong> ________________</p>
<p><strong>Barangay:</strong> ____________</p>
<p><strong>City/Municipality:</strong> BAYBAY CITY</p>

<h2>Project Information</h2>
<p><strong>Project Title:</strong> ________________</p>
<p><strong>Project Description:</strong> ________________</p>
<p><strong>Project Duration:</strong> ________________</p>

<h2>Approval Criteria</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Criteria</th>
<th>Status</th>
<th>Comments</th>
</tr>
</thead>
<tbody>
<tr><td>Budget Approval</td><td>□ Met □ Not Met</td><td></td></tr>
<tr><td>Technical Requirements</td><td>□ Met □ Not Met</td><td></td></tr>
<tr><td>Regulatory Compliance</td><td>□ Met □ Not Met</td><td></td></tr>
</tbody>
</table>

<h2>Required Approvals</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Role</th>
<th>Name</th>
<th>Signature</th>
<th>Date</th>
</tr>
</thead>
<tbody>
<tr><td>SK Chairperson</td><td></td><td></td><td></td></tr>
<tr><td>Committee Head</td><td></td><td></td><td></td></tr>
<tr><td>Financial Officer</td><td></td><td></td><td></td></tr>
</tbody>
</table>

<h2>Compliance Verification</h2>
<p><strong>Regulatory Requirements Met:</strong> □ Yes □ No</p>
<p><strong>Legal Requirements Met:</strong> □ Yes □ No</p>
<p><strong>Documentation Complete:</strong> □ Yes □ No</p>

<h2>Final Authorization</h2>
<p>This project is hereby authorized to proceed subject to the conditions and requirements outlined above.</p>

<p><strong>Authorized by:</strong><br>
___________________<br>
SK Chairperson<br>
Date: _________________</p>`;

export async function generateApprovalDocument(formData: ApprovalFormData): Promise<string> {
    const {
        approvalCriteria,
        stakeholderSignoffs,
        complianceRequirements,
        reviewProcess,
        documentation
    } = formData;

    const userPrompt = `Generate a complete Approval and Authorization Document based on the following information:

**Approval Criteria:**
${approvalCriteria}

**Required Stakeholder Sign-offs:**
${stakeholderSignoffs}

**Compliance & Regulatory Requirements:**
${complianceRequirements}

**Review Process:**
${reviewProcess}

**Supporting Documentation Requirements:**
${documentation}

Generate a professional approval document using proper HTML formatting with tables, headings, and structure. Include sections for approval criteria, stakeholder authorizations, compliance verification, and final authorization. Use today's date (${new Date().toLocaleDateString('en-PH')}) where needed. Create a formal document ready for official use.`;

    const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.2,
        maxTokens: 65535,
    });

    return text;
} 