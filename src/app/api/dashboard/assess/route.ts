import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getLpaApprovalRate } from "@/lib/planning-data/lpa-rates";


export const runtime = 'edge';
interface ConstraintInput {
  is_listed: boolean;
  listed_grade: string | null;
  nhle_name?: string | null;
  nhle_entry?: number | null;
  nhle_url?: string | null;
  is_conservation: boolean;
  conservation_name: string | null;
  is_green_belt: boolean;
  is_flood_risk: boolean;
  flood_zone: string | null;
  is_article_4: boolean;
  is_aonb: boolean;
  is_tree_preservation?: boolean;
  is_ancient_woodland?: boolean;
  is_scheduled_monument?: boolean;
  is_sssi?: boolean;
  sssi_name?: string | null;
  is_national_park?: boolean;
  national_park_name?: string | null;
  is_sac?: boolean;
  sac_name?: string | null;
  is_spa?: boolean;
  spa_name?: string | null;
  is_ramsar?: boolean;
  ramsar_name?: string | null;
  is_historic_park?: boolean;
  historic_park_name?: string | null;
  is_world_heritage_site?: boolean;
  world_heritage_site_name?: string | null;
  is_world_heritage_buffer?: boolean;
  is_heritage_at_risk?: boolean;
  is_archaeological_priority?: boolean;
  is_locally_listed?: boolean;
  is_local_nature_reserve?: boolean;
  is_flood_storage_area?: boolean;
}

function constraintSummary(c: ConstraintInput): string {
  const lines: string[] = [];
  if (c.is_listed)                lines.push(`- Listed building: Grade ${c.listed_grade ?? "II"}${c.nhle_name ? ` — ${c.nhle_name}` : ""}${c.nhle_entry ? ` (NHLE #${c.nhle_entry})` : ""} — Listed Building Consent required`);
  if (c.is_conservation)          lines.push(`- Conservation area: ${c.conservation_name ?? "yes"}`);
  if (c.is_locally_listed)        lines.push("- Locally listed building");
  if (c.is_local_nature_reserve)  lines.push("- Local Nature Reserve — ecological impact may need to be addressed");
  if (c.is_flood_storage_area)    lines.push("- Flood Storage Area — development almost certainly incompatible with this designation");
  if (c.is_heritage_at_risk)      lines.push("- On Historic England's Heritage at Risk register");
  if (c.is_green_belt)            lines.push("- Green belt land: yes");
  if (c.is_flood_risk)            lines.push(`- Flood Zone ${c.flood_zone ?? "2/3"}${c.is_flood_storage_area ? " (Flood Storage Area)" : ""}${c.flood_zone === "3" ? " — Sequential Test and Flood Risk Assessment required for most development" : " — drainage strategy may be required"}`);
  if (c.is_article_4)             lines.push("- Article 4 direction applies");
  if (c.is_aonb)                  lines.push("- AONB / National Landscape");
  if (c.is_national_park)         lines.push(`- National Park: ${c.national_park_name ?? "yes"}`);
  if (c.is_tree_preservation)     lines.push("- Tree Preservation Order on site");
  if (c.is_ancient_woodland)      lines.push("- Ancient woodland nearby");
  if (c.is_scheduled_monument)    lines.push("- Scheduled monument");
  if (c.is_archaeological_priority) lines.push("- Archaeological priority area");
  if (c.is_sssi)                  lines.push(`- SSSI: ${c.sssi_name ?? "yes"}`);
  if (c.is_sac)                   lines.push(`- Special Area of Conservation: ${c.sac_name ?? "yes"}`);
  if (c.is_spa)                   lines.push(`- Special Protection Area: ${c.spa_name ?? "yes"}`);
  if (c.is_ramsar)                lines.push(`- Ramsar site: ${c.ramsar_name ?? "yes"}`);
  if (c.is_historic_park)         lines.push(`- Registered Historic Park & Garden: ${c.historic_park_name ?? "yes"}`);
  if (c.is_world_heritage_site)   lines.push(`- UNESCO World Heritage Site: ${c.world_heritage_site_name ?? "yes"}`);
  if (c.is_world_heritage_buffer) lines.push("- Within UNESCO World Heritage Site buffer zone");
  return lines.length ? lines.join("\n") : "- No major planning constraints detected";
}

function buildExtrasSection(body: Record<string, string | undefined>): string {
  const lines: string[] = [];
  if (body.propertyType)    lines.push(`- Property type: ${body.propertyType}`);
  if (body.tenure)          lines.push(`- Ownership / tenure: ${body.tenure}`);
  if (body.garageAttachment) lines.push(`- Structure: ${body.garageAttachment}`);
  if (body.garageUse)       lines.push(`- Intended use: ${body.garageUse}`);
  if (body.treeWorkType)    lines.push(`- Tree work type: ${body.treeWorkType}`);
  if (body.treeTPO)         lines.push(`- TPO / conservation area status: ${body.treeTPO}`);
  if (body.treeDiameter)    lines.push(`- Tree trunk diameter: ${body.treeDiameter}`);
  if (body.currentUse)      lines.push(`- Current use class: ${body.currentUse}`);
  if (body.proposedUse)     lines.push(`- Proposed use class: ${body.proposedUse}`);
  return lines.length ? lines.join("\n") : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { address, council, lpa_code, projectType, size, roof, material, description, constraints } = body;

    if (!address || typeof address !== "string" || address.length > 300) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    // Clamp free-text fields to prevent prompt injection with oversized inputs
    const safeProjectType   = typeof projectType   === "string" ? projectType.slice(0, 200)   : "";
    const safeDescription   = typeof description   === "string" ? description.slice(0, 1000)  : "";
    const epc = constraints?.epc ?? null;

    // Look up real government approval rate first (MHCLG PS2, 2023–2024)
    const officialRate = getLpaApprovalRate(lpa_code);

    const extrasSection = buildExtrasSection(body);

    // EPC enrichment section
    const epcSection = epc?.found
      ? [
          epc.property_type     && `- Property type (EPC): ${epc.property_type}${epc.built_form ? ` / ${epc.built_form}` : ""}`,
          epc.construction_age_band && `- Construction age (EPC): ${epc.construction_age_band}`,
          epc.total_floor_area  && `- Floor area (EPC): ${epc.total_floor_area} m²`,
          epc.current_energy_rating && `- EPC rating: ${epc.current_energy_rating}`,
        ].filter(Boolean).join("\n")
      : "";

    const prompt = `You are a UK planning consultant assessing a householder planning application.

PROJECT DETAILS:
- Address: ${address}
- Local Planning Authority: ${council ?? "not specified"}
- Project type: ${safeProjectType || "not specified"}
- Size / scope: ${size ?? "not specified"}
- Roof type: ${roof ?? "not specified"}
- Materials: ${material ?? "not specified"}
- Description: ${safeDescription || "not specified"}${extrasSection ? `\n${extrasSection}` : ""}${epcSection ? `\n${epcSection}` : ""}

SITE CONSTRAINTS:
${constraintSummary(constraints ?? {})}

Provide a structured feasibility assessment as a JSON object with this EXACT structure — no markdown, no explanation, JSON only:

{
  "score": <integer 0–100 representing approval likelihood>,
  "verdict": "<exactly one of: 'Very likely approved' | 'Likely approved' | 'Borderline' | 'At risk' | 'Likely refused'>",
  "risks": [
    {
      "title": "<concise risk title>",
      "severity": "<exactly one of: 'high' | 'medium' | 'low'>",
      "detail": "<one or two sentences on the risk and how to address it>"
    }
  ],
  "summary": "<two sentences summarising the overall prospects for this application>"
}

Scoring guide — use the LOWEST applicable band:
- No constraints, straightforward project: 70–85
- Article 4 direction only: 55–70
- Archaeological priority area or locally listed building (single constraint): 50–65
- Conservation area (single constraint, sympathetic design): 45–60
- Conservation area + Article 4 combined: 30–50
- Conservation area + Article 4 + unsympathetic materials or scale: 20–40
- Listed building (any): 25–50
- Green belt or AONB or National Park: 25–55
- SSSI, SAC, SPA, or Ramsar (ecological designations): 15–40
- Scheduled monument or UNESCO World Heritage Site: 10–30
- Multiple serious constraints (any 2+ of: conservation area, listed, Article 4, green belt, AONB, SSSI, SAC, Scheduled Monument, WHS): 10–35

Verdict bands:
- 70–100 → "Very likely approved"
- 55–69  → "Likely approved"
- 40–54  → "Borderline"
- 25–39  → "At risk"
- 0–24   → "Likely refused"

Important: be conservative. Most refused applications were assessed too optimistically at the outset. If the design approach is described as contemporary or non-traditional in a heritage context, treat this as a significant downward factor.

Include 2–4 risk items ordered high → low severity.

Important rules for risk factors:
- Each risk must describe a genuine planning policy concern, not a comment about the information provided
- Do NOT include risks like "Limited design information" or "Insufficient detail provided" — these are meta-comments about the application, not planning risks
- If detail is missing, express it as a positive action the applicant must take: e.g. "RBKC requires full material specifications and fenestration details for any conservation area application — submit these with your Design & Access Statement"
- Keep risks grounded in planning policy (NPPF, local plan, LPA known positions)

Return ONLY the JSON object.`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 800,
      temperature: 0.2,
      system: "You are an expert UK planning consultant. Return ONLY valid JSON with no markdown fences, no commentary, no extra text.",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";

    // Extract JSON robustly
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return NextResponse.json({ error: "Invalid response from model" }, { status: 500 });
    }
    const parsed = JSON.parse(raw.slice(start, end + 1));

    // Attach official approval rate (overrides any Claude estimate)
    const isHeritage = constraints?.is_conservation || constraints?.is_listed;
    const hasArticle4 = constraints?.is_article_4;
    const needsCaveat = isHeritage || hasArticle4;

    if (officialRate) {
      parsed.area_approval_rate        = officialRate.rate;
      parsed.area_approval_rate_source = "official";
      parsed.area_approval_rate_label  = officialRate.label;
      parsed.area_approval_rate_caveat = needsCaveat
        ? "Borough average across all householder types. Conservation area and Article 4 applications face stricter assessment — actual rates for complex heritage applications are typically lower."
        : null;
    } else {
      parsed.area_approval_rate        = null;
      parsed.area_approval_rate_source = "none";
      parsed.area_approval_rate_label  = null;
      parsed.area_approval_rate_caveat = null;
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[dashboard/assess]", err);
    return NextResponse.json({ error: "Assessment failed" }, { status: 500 });
  }
}
