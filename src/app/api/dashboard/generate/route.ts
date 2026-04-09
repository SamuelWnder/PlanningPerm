import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";


export const runtime = 'edge';
interface GenerateInput {
  address:        string;
  council:        string;
  projectType:    string;
  propertyType:   string;
  tenure:         string;
  size:           string;
  roof:           string;
  material:       string;
  description:    string;
  today:          string;
  signatoryName:  string;
  docRef:         string;
}

function projectContext(ctx: GenerateInput): string {
  const lines = [
    `Address: ${ctx.address}`,
    `Local Planning Authority: ${ctx.council}`,
    `Project type: ${ctx.projectType}`,
    `Property type: ${ctx.propertyType || "residential dwelling"}`,
    `Tenure: ${ctx.tenure || "owner-occupier"}`,
  ];
  if (ctx.size)        lines.push(`Approximate size: ${ctx.size}`);
  if (ctx.roof)        lines.push(`Roof type: ${ctx.roof}`);
  if (ctx.material)    lines.push(`Materials: ${ctx.material}`);
  if (ctx.description) lines.push(`Additional description: ${ctx.description}`);
  return lines.map((l) => `- ${l}`).join("\n");
}

const PROMPTS: Record<string, (ctx: GenerateInput) => string> = {
  design_access_statement: (ctx) => `
You are a UK planning consultant writing a Design and Access Statement for a householder planning application.

PROJECT DETAILS:
${projectContext(ctx)}

Write a professional Design and Access Statement in HTML format suitable for a UK householder planning application. Include these sections:

1. Introduction
2. Site and Setting (existing character, relationship to neighbours, street scene — be specific to the property type and location)
3. The Proposed Development (description, design rationale, materials — use the specific materials stated above; if materials say "to match existing" note this clearly)
4. Access (no change to vehicular access unless stated)
5. Planning Policy (reference NPPF and any relevant ${ctx.council} local plan policies)
6. Conclusion

CRITICAL REQUIREMENTS:
- The property type is ${ctx.propertyType || "a residential dwelling"} — every reference to the dwelling must use this exact type consistently
- Use the specific tenure (${ctx.tenure || "owner-occupier"}) where relevant
- Do NOT invent or assume materials — use exactly what is stated above
- If materials say "to match existing", include a note that the applicant should specify the exact existing materials before submission
- Reference relevant NPPF paragraphs (especially paragraphs on design quality and sustainable development)
- Write in formal but clear English
- Format as clean HTML with <h2> headings, <p> paragraphs, <ul> lists where appropriate
- Total length: 600–900 words
`,

  planning_statement: (ctx) => `
You are a UK planning consultant writing a Planning Statement for a householder planning application.

PROJECT DETAILS:
${projectContext(ctx)}

Write a professional Planning Statement in HTML format. Include:

1. Introduction and Application Description
2. The Application Site and its Setting
3. Planning Policy Framework (NPPF, ${ctx.council} Local Plan, and any other relevant development plan documents)
4. Assessment of the Proposal against each key policy
5. Planning Balance and Conclusion

CRITICAL REQUIREMENTS:
- The property type is ${ctx.propertyType || "a residential dwelling"} — use this consistently throughout. Do NOT describe it as any other dwelling type.
- Argue positively for the application
- Address any obvious policy concerns (scale, amenity, design) pre-emptively
- Reference the NPPF presumption in favour of sustainable development
- Be specific to ${ctx.council}'s policy context, not generic
- Format as clean HTML with <h2> headings and <p> paragraphs
- Total length: 700–1000 words
`,

  heritage_statement: (ctx) => `
You are a UK planning consultant writing a Heritage Statement to accompany a householder planning application in or near a heritage-sensitive area.

PROJECT DETAILS:
${projectContext(ctx)}

Write a professional Heritage Statement in HTML format. Include:

1. Introduction
2. Description of the Heritage Asset (character, history, architectural significance)
3. Description of the Proposed Works
4. Impact Assessment (how the works preserve or enhance the heritage significance)
5. Policy Context (NPPF Chapter 16 paragraphs 195–208, relevant ${ctx.council} local plan heritage policies)
6. Conclusion

CRITICAL REQUIREMENTS:
- The property type is ${ctx.propertyType || "a residential dwelling"} — use this consistently
- Demonstrate that the proposal causes no unacceptable harm to significance
- Reference specific NPPF paragraphs
- Be proportionate — this is a householder application
- Format as clean HTML with <h2> headings and <p> paragraphs
- Total length: 600–900 words
`,

  cover_letter: (ctx) => `
You are a UK planning consultant writing a cover letter to accompany a householder planning application.

PROJECT DETAILS:
${projectContext(ctx)}

Today's date: ${ctx.today}
Applicant name: ${ctx.signatoryName}

Write a professional, concise cover letter in HTML format to the planning officer. It should:

1. Open with the full property address as the letter address block (one line per address element)
2. Below the address, show the date: ${ctx.today}
3. Reference "Dear Planning Officer,"
4. Introduce the application — state the property type (${ctx.propertyType || "residential dwelling"}) and what is proposed
5. Note that a Design & Access Statement, Planning Statement, and architectural drawings accompany this application
6. Offer to provide any further information
7. Close with "Yours faithfully," on its own line, then "${ctx.signatoryName}" on the next line

CRITICAL REQUIREMENTS:
- Use today's date (${ctx.today}) — do NOT write "[Date]" anywhere
- Sign off as "${ctx.signatoryName}" — do NOT write "[Applicant Name]" anywhere
- The property type is ${ctx.propertyType || "a residential dwelling"} — use this consistently, do not invent a different type
- Keep it 200–300 words maximum
- Format as a proper letter in HTML using only <p> tags — no <h2> headings in a letter
`,
};

// Common AI typo corrections to apply to all generated documents
const TYPO_FIXES: [RegExp, string][] = [
  [/\bfat roof\b/gi,           "flat roof"],
  [/\bfat-roof\b/gi,           "flat-roof"],
  [/\bpermited development\b/gi, "permitted development"],
  [/\bneighbour impact\b/gi,   "neighbour amenity impact"],
];

function applyTypoFixes(html: string): string {
  return TYPO_FIXES.reduce((text, [pattern, fix]) => text.replace(pattern, fix), html);
}

function buildDocRef(address: string): string {
  const now    = new Date();
  const year   = now.getFullYear();
  const month  = String(now.getMonth() + 1).padStart(2, "0");
  const day    = String(now.getDate()).padStart(2, "0");
  // Extract postcode sector from end of address (e.g. "SE28 8QS" → "SE28")
  const pcMatch = address.match(/([A-Z]{1,2}[0-9][0-9A-Z]?)\s*[0-9]/i);
  const sector  = pcMatch ? pcMatch[1].toUpperCase() : "UK";
  return `PP-${year}-${month}-${day}-${sector}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, council, projectType, propertyType, tenure, size, roof, material, description, documentType, applicantName } = body;

    const promptFn = PROMPTS[documentType];
    if (!promptFn) {
      return NextResponse.json({ error: "Unknown document type" }, { status: 400 });
    }

    const today      = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const signatoryName = applicantName && applicantName.trim() ? applicantName.trim() : "The Applicant";
    const docRef     = buildDocRef(address ?? "");

    const prompt = promptFn({
      address,
      council,
      projectType,
      propertyType:    propertyType    ?? "",
      tenure:          tenure          ?? "",
      size:            size            ?? "",
      roof:            roof            ?? "",
      material:        material        ?? "",
      description:     description     ?? "",
      today,
      signatoryName,
      docRef,
    });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      temperature: 0.3,
      system:
        "You are an expert UK planning consultant. Write clear, professional planning documents in HTML format. Do not include <!DOCTYPE>, <html>, <head>, or <body> tags — just the document content starting from the first heading.",
      messages: [{ role: "user", content: prompt }],
    });

    let content = message.content[0].type === "text" ? message.content[0].text : "";

    // Post-process: fix known AI typos
    content = applyTypoFixes(content);

    // Prepend document reference header
    content = `<p style="font-size:0.85em;color:#64787a;margin:0 0 20px 0;padding-bottom:12px;border-bottom:1px solid #e0eaea">PlanningPerm Ref: ${docRef}</p>\n${content}`;

    return NextResponse.json({ content });
  } catch (err) {
    console.error("[dashboard/generate]", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
