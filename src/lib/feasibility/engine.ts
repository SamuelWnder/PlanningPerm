/**
 * Feasibility Engine
 *
 * Given a project description and LPA code, this engine:
 * 1. Queries the Python service for similar historical decisions (vector search)
 * 2. Queries for relevant local plan / NPPF policy chunks
 * 3. Checks permitted development rules
 * 4. Constructs a GPT-4o prompt with all context
 * 5. Returns a structured FeasibilityReport
 */

import OpenAI from "openai";
import type {
  FeasibilityReport,
  ProjectType,
  PropertyType,
  ComparableCase,
} from "@/types/database";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

interface FeasibilityInput {
  address: string;
  lpa_code: string;
  lpa_name: string;
  description: string;
  project_type: ProjectType;
  property_type: PropertyType;
  is_listed: boolean;
  is_conservation_area: boolean;
}

interface SimilarDecision {
  decision_id: string;
  reference: string;
  address: string;
  description: string;
  decision: string;
  decision_date: string;
  lpa_name: string;
  similarity: number;
}

interface PolicyChunk {
  chunk_id: string;
  lpa_code: string | null;
  document_name: string;
  section: string | null;
  content: string;
  similarity: number;
}

async function fetchSimilarDecisions(
  queryText: string,
  lpaCode: string,
  applicationType?: string
): Promise<SimilarDecision[]> {
  const pythonUrl = process.env.PYTHON_SERVICE_URL;
  const apiKey = process.env.PYTHON_SERVICE_API_KEY;

  if (!pythonUrl || !apiKey) {
    console.warn("Python service not configured — skipping vector search");
    return [];
  }

  try {
    const resp = await fetch(`${pythonUrl}/search/decisions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        query_text: queryText,
        lpa_code: lpaCode,
        application_type: applicationType,
        match_count: 30,
      }),
      next: { revalidate: 0 },
    });

    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || [];
  } catch {
    return [];
  }
}

async function fetchPolicyChunks(
  queryText: string,
  lpaCode: string
): Promise<PolicyChunk[]> {
  const pythonUrl = process.env.PYTHON_SERVICE_URL;
  const apiKey = process.env.PYTHON_SERVICE_API_KEY;

  if (!pythonUrl || !apiKey) return [];

  try {
    const resp = await fetch(`${pythonUrl}/search/policy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        query_text: queryText,
        lpa_code: lpaCode,
        match_count: 8,
      }),
      next: { revalidate: 0 },
    });

    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || [];
  } catch {
    return [];
  }
}

function buildSystemPrompt(): string {
  return `You are a senior UK planning consultant with 20 years of experience across English local planning authorities. You have deep knowledge of the National Planning Policy Framework (NPPF), permitted development rights (GPDO 2015), and local development plan policies.

Your role is to assess planning feasibility for homeowner projects and give honest, expert assessments based on real planning data. You speak plainly — no jargon. You give genuine opinions based on evidence, not hedged non-answers.

Always respond with a valid JSON object matching the exact schema specified.`;
}

function buildUserPrompt(
  input: FeasibilityInput,
  decisions: SimilarDecision[],
  policyChunks: PolicyChunk[]
): string {
  const approvedCount = decisions.filter((d) => d.decision === "approved").length;
  const refusedCount = decisions.filter((d) => d.decision === "refused").length;
  const approvalRate =
    decisions.length > 0
      ? Math.round((approvedCount / decisions.length) * 100)
      : null;

  const decisionsSummary =
    decisions.length > 0
      ? decisions
          .slice(0, 15)
          .map(
            (d, i) =>
              `${i + 1}. [${d.decision.toUpperCase()}] ${d.address} — "${d.description}" (${d.decision_date}, ref: ${d.reference}, similarity: ${d.similarity})`
          )
          .join("\n")
      : "No comparable decisions found in our database for this LPA.";

  const policySummary =
    policyChunks.length > 0
      ? policyChunks
          .map(
            (c) =>
              `[${c.document_name}${c.section ? ` § ${c.section}` : ""}]: ${c.content.slice(0, 300)}...`
          )
          .join("\n\n")
      : "No specific local plan policies retrieved.";

  return `## Project for Assessment

**Address:** ${input.address}
**LPA:** ${input.lpa_name} (${input.lpa_code})
**Project type:** ${input.project_type.replace(/_/g, " ")}
**Property type:** ${input.property_type.replace(/_/g, " ")}
**Listed building:** ${input.is_listed ? "Yes" : "No"}
**Conservation area:** ${input.is_conservation_area ? "Yes" : "No"}
**Description:** ${input.description}

---

## Comparable Planning Decisions in ${input.lpa_name}
(${decisions.length} similar cases found — ${approvalRate !== null ? `${approvalRate}% approved` : "approval rate unknown"})

${decisionsSummary}

---

## Relevant Local Plan / NPPF Policy

${policySummary}

---

## Your Task

Based on this evidence, provide a thorough planning feasibility assessment. Return a JSON object with this exact structure:

{
  "score": <number 0-100, approval likelihood percentage>,
  "confidence": <"high" | "medium" | "low" — based on how much comparable data we have>,
  "summary": <2-3 sentence plain English summary of the assessment>,
  "key_risks": [
    {
      "factor": <short risk name>,
      "severity": <"high" | "medium" | "low">,
      "explanation": <1-2 sentences explaining the risk>,
      "mitigation": <optional: how to reduce the risk>
    }
  ],
  "comparable_cases": [
    {
      "reference": <app reference>,
      "address": <address>,
      "description": <description>,
      "decision": <"approved" | "refused" | "withdrawn">,
      "decision_date": <YYYY-MM-DD>,
      "similarity_score": <0-1>,
      "notes": <why this case is relevant>
    }
  ],
  "policy_notes": [<key policy points that apply to this project>],
  "permitted_development": {
    "likely_pd": <true/false — is this likely permitted development?>,
    "pd_class": <"Class A" | "Class B" | etc. or null>,
    "limitations": [<any PD limitations that apply>]
  },
  "recommendation": <1 paragraph — what should the applicant do next?>,
  "generated_at": "${new Date().toISOString()}"
}

Include the 3-5 most relevant comparable cases. Be honest about risk. If the data strongly suggests refusal, say so.`;
}

export async function runFeasibilityEngine(
  input: FeasibilityInput
): Promise<FeasibilityReport> {
  const queryText = `${input.project_type.replace(/_/g, " ")} at ${input.property_type.replace(/_/g, " ")} property: ${input.description}`;

  // Fetch context in parallel
  const [decisions, policyChunks] = await Promise.all([
    fetchSimilarDecisions(queryText, input.lpa_code),
    fetchPolicyChunks(queryText, input.lpa_code),
  ]);

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(input, decisions, policyChunks);

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2, // Low temperature for consistent structured output
  });

  const raw = completion.choices[0].message.content;
  if (!raw) throw new Error("Empty response from GPT-4o");

  const report = JSON.parse(raw) as FeasibilityReport;

  // Fill in any comparable cases from our database that GPT selected
  // (GPT returns references, we enrich from the decisions array)
  const decisionMap = new Map(decisions.map((d) => [d.reference, d]));
  report.comparable_cases = (report.comparable_cases || []).map(
    (c: ComparableCase) => {
      const match = decisionMap.get(c.reference);
      return match
        ? {
            ...c,
            address: match.address,
            description: match.description,
            decision_date: match.decision_date,
            similarity_score: match.similarity,
          }
        : c;
    }
  );

  return report;
}
