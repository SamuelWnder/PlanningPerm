/**
 * Document Generator
 *
 * Generates planning documents using GPT-4o:
 * - Design and Access Statement (D&A Statement)
 * - Planning Statement
 * - Cover letter to planning officer
 * - Appeal statement (if refused)
 *
 * Documents are pre-filled from project data and the feasibility report,
 * so they contain specific details about the property and proposal.
 */

import OpenAI from "openai";
import type { DocumentType, FeasibilityReport } from "@/types/database";

interface DocumentInput {
  project: {
    address: string;
    lpa_name: string | null;
    project_type: string;
    property_type: string;
    is_listed: boolean;
    is_conservation_area: boolean;
    description: string;
  };
  report: FeasibilityReport | null;
  applicant_name?: string;
  document_type: DocumentType;
  refusal_reason?: string; // For appeal statements
}

const DOCUMENT_PROMPTS: Record<DocumentType, (input: DocumentInput) => string> = {
  design_access_statement: (input) => `
You are a UK planning consultant writing a Design and Access Statement for a householder planning application.

PROJECT DETAILS:
- Address: ${input.project.address}
- LPA: ${input.project.lpa_name || "Not specified"}
- Project type: ${input.project.project_type.replace(/_/g, " ")}
- Property type: ${input.project.property_type.replace(/_/g, " ")}
- Listed building: ${input.project.is_listed ? "Yes" : "No"}
- Conservation area: ${input.project.is_conservation_area ? "Yes" : "No"}
- Description: ${input.project.description}
${input.report?.policy_notes?.length ? `\nRelevant policy context:\n${input.report.policy_notes.join("\n")}` : ""}

Write a professional Design and Access Statement in HTML format suitable for a UK householder planning application. Include these sections:

1. Introduction
2. Site and Setting (existing character, relationship to neighbours, street scene)
3. The Proposed Development (description, design rationale, materials)
4. Access (no change to access details if applicable)
5. Planning Policy (reference NPPF and any relevant local policies)
6. Conclusion

Requirements:
- Write in formal but clear English
- Reference relevant NPPF paragraphs where appropriate
- Be specific to this property type and project
- Highlight how the design responds to the local character
- Keep it proportionate — householder applications don't need extensive statements
- Format as clean HTML with <h2> headings, <p> paragraphs, <ul> lists where appropriate
- Total length: 600–900 words
`,

  planning_statement: (input) => `
You are a UK planning consultant writing a Planning Statement for a householder planning application.

PROJECT DETAILS:
- Address: ${input.project.address}
- LPA: ${input.project.lpa_name || "Not specified"}
- Project type: ${input.project.project_type.replace(/_/g, " ")}
- Property type: ${input.project.property_type.replace(/_/g, " ")}
- Listed building: ${input.project.is_listed ? "Yes" : "No"}
- Conservation area: ${input.project.is_conservation_area ? "Yes" : "No"}
- Description: ${input.project.description}
${input.report?.policy_notes?.length ? `\nRelevant policy:\n${input.report.policy_notes.join("\n")}` : ""}
${input.report?.comparable_cases?.length ? `\nComparable approved cases:\n${input.report.comparable_cases.filter(c => c.decision === "approved").slice(0, 3).map(c => `- ${c.address}: ${c.description}`).join("\n")}` : ""}

Write a professional Planning Statement in HTML format. Include:

1. Introduction and Application Description
2. The Application Site and its Setting
3. Planning History (if any known relevant history)
4. Planning Policy Framework (NPPF, development plan policies)
5. Assessment of the Proposal
6. Planning Balance and Conclusion

Requirements:
- Argue positively for the application
- Address any obvious policy concerns pre-emptively
- Reference the NPPF presumption in favour of sustainable development where relevant
- Be specific, not generic
- Format as clean HTML
- Total length: 700–1000 words
`,

  cover_letter: (input) => `
You are a UK planning consultant writing a cover letter to accompany a householder planning application.

PROJECT DETAILS:
- Address: ${input.project.address}
- LPA: ${input.project.lpa_name || "the council"}
- Project type: ${input.project.project_type.replace(/_/g, " ")}
- Description: ${input.project.description}
- Applicant name: ${input.applicant_name || "[Applicant Name]"}

Write a professional, concise cover letter in HTML format to the planning officer. It should:

1. Introduce the application
2. Briefly describe what is proposed
3. Note that supporting documents (D&A Statement, drawings) are enclosed
4. Offer to provide any further information
5. Sign off professionally

Requirements:
- Formal but not stiff
- 200–300 words maximum
- Format as a proper letter in HTML with address block, date, salutation, body, and sign-off
- Use [Date] as placeholder for the date
`,

  appeal_statement: (input) => `
You are a UK planning consultant writing an appeal statement for a householder planning appeal to the Planning Inspectorate.

PROJECT DETAILS:
- Address: ${input.project.address}
- LPA: ${input.project.lpa_name || "the LPA"}
- Project type: ${input.project.project_type.replace(/_/g, " ")}
- Description: ${input.project.description}
- Grounds for refusal: ${input.refusal_reason || "Not specified"}
${input.report?.policy_notes?.length ? `\nPolicy context:\n${input.report.policy_notes.join("\n")}` : ""}
${input.report?.comparable_cases?.length ? `\nComparable cases:\n${input.report.comparable_cases.slice(0, 5).map(c => `- [${c.decision.toUpperCase()}] ${c.address}: ${c.description}`).join("\n")}` : ""}

Write a professional appeal statement in HTML format. Include:

1. Introduction
2. The Proposal and Site
3. The Reasons for Refusal — Addressed in Turn
4. Planning Policy Assessment
5. Appeal Statement / Ground of Appeal
6. Conclusion

Requirements:
- Directly and methodically rebut each ground of refusal
- Reference NPPF and development plan policies
- Use comparable approved cases as supporting evidence
- Be measured and professional — not adversarial
- Format as clean HTML
- Total length: 800–1200 words
`,
};

export async function generateDocument(input: DocumentInput): Promise<string> {
  const prompt = DOCUMENT_PROMPTS[input.document_type](input);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an expert UK planning consultant. Write clear, professional planning documents in HTML format. Do not include <!DOCTYPE>, <html>, <head>, or <body> tags — just the document content in HTML.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  return completion.choices[0].message.content || "";
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  design_access_statement: "Design & Access Statement",
  planning_statement: "Planning Statement",
  cover_letter: "Cover Letter",
  appeal_statement: "Appeal Statement",
};
