import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { WithdrawalFormData } from '@/components/project/steps';

const systemPrompt = `You are an AI assistant responsible for generating official "Project Closure and Final Report Documents" for SK Councils in the Philippines.
Follow these instructions precisely:

For Project Closure Documents:
- Provide comprehensive project summaries and final status reports
- Document lessons learned and knowledge transfer
- Detail final deliverables and completion status
- Include stakeholder feedback and evaluation results
- Offer future recommendations and improvement suggestions

Your output must be in proper HTML format with headings, tables, sections, and professional structure suitable for a rich text editor.

Sample Document Format for Reference:

## Project Closure Document Template:
<h1>PROJECT CLOSURE & FINAL REPORT</h1>
<p><strong>Document No.:</strong> ________________</p>
<p><strong>Date:</strong> ________________</p>
<p><strong>Barangay:</strong> ____________</p>
<p><strong>City/Municipality:</strong> BAYBAY CITY</p>

<h2>Project Overview</h2>
<p><strong>Project Title:</strong> ________________</p>
<p><strong>Project Period:</strong> ________________</p>
<p><strong>Final Status:</strong> ________________</p>

<h2>Project Summary</h2>
<h3>Objectives & Achievements</h3>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Objective</th>
<th>Target</th>
<th>Achievement</th>
<th>Status</th>
</tr>
</thead>
<tbody>
<tr><td></td><td></td><td></td><td>Completed</td></tr>
<tr><td></td><td></td><td></td><td>Partially Completed</td></tr>
</tbody>
</table>

<h2>Final Deliverables</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Deliverable</th>
<th>Description</th>
<th>Completion Date</th>
<th>Status</th>
</tr>
</thead>
<tbody>
<tr><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td></td></tr>
</tbody>
</table>

<h2>Lessons Learned</h2>
<h3>What Worked Well</h3>
<ul>
<li>________________</li>
<li>________________</li>
</ul>

<h3>Challenges & How They Were Addressed</h3>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Challenge</th>
<th>Impact</th>
<th>Resolution</th>
</tr>
</thead>
<tbody>
<tr><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td></tr>
</tbody>
</table>

<h3>Key Insights & Knowledge Gained</h3>
<p>________________</p>

<h2>Stakeholder Feedback</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Stakeholder</th>
<th>Feedback Summary</th>
<th>Satisfaction Rating</th>
</tr>
</thead>
<tbody>
<tr><td>Community Members</td><td></td><td></td></tr>
<tr><td>SK Officials</td><td></td><td></td></tr>
<tr><td>Project Team</td><td></td><td></td></tr>
</tbody>
</table>

<h2>Budget & Resource Utilization</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Resource Type</th>
<th>Allocated</th>
<th>Utilized</th>
<th>Variance</th>
</tr>
</thead>
<tbody>
<tr><td>Budget</td><td></td><td></td><td></td></tr>
<tr><td>Human Resources</td><td></td><td></td><td></td></tr>
<tr><td>Equipment</td><td></td><td></td><td></td></tr>
</tbody>
</table>

<h2>Future Recommendations</h2>
<h3>Recommendations for Similar Projects</h3>
<ul>
<li>________________</li>
<li>________________</li>
</ul>

<h3>Areas for Improvement</h3>
<ul>
<li>________________</li>
<li>________________</li>
</ul>

<h2>Project Closure Approval</h2>
<p>This project is hereby officially closed. All deliverables have been reviewed and accepted.</p>

<p><strong>Project Manager:</strong><br>
___________________<br>
Signature & Date</p>

<p><strong>SK Chairperson:</strong><br>
___________________<br>
Signature & Date</p>

<p><strong>Sponsor/Client:</strong><br>
___________________<br>
Signature & Date</p>`;

export async function generateWithdrawalDocument(formData: WithdrawalFormData): Promise<string> {
    const {
        projectSummary,
        lessonsLearned,
        finalDeliverables,
        stakeholderFeedback,
        futureRecommendations
    } = formData;

    const userPrompt = `Generate a complete Project Closure and Final Report Document based on the following information:

**Project Summary:**
${projectSummary}

**Lessons Learned:**
${lessonsLearned}

**Final Deliverables:**
${finalDeliverables}

**Stakeholder Feedback:**
${stakeholderFeedback}

**Future Recommendations:**
${futureRecommendations}

Generate a comprehensive project closure document using proper HTML formatting with tables, headings, and structure. Include detailed project summaries, lessons learned, deliverable status, stakeholder evaluations, and future recommendations. Use today's date (${new Date().toLocaleDateString('en-PH')}) where needed. Create a professional document ready for project closure and archival.`;

    const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.2,
        maxTokens: 65535,
    });

    return text;
} 