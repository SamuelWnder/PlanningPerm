/**
 * Planning Portal application status checker.
 *
 * The UK Planning Portal has a public API that allows lookup of planning
 * application status by reference number and LPA code.
 *
 * API: https://api.planningportal.co.uk/search/
 *
 * For LPAs using Idox, we can also scrape their individual portals
 * for more detailed status information (officer name, objection count, etc.)
 */

export interface ApplicationStatus {
  reference: string;
  lpa_code: string;
  status: string;
  officer_assigned: string | null;
  consultation_end_date: string | null;
  decision_due_date: string | null;
  objections_count: number;
  last_event: string | null;
  decision: string | null;
  raw: Record<string, unknown>;
}

/**
 * Fetch the current status of a planning application.
 * Falls back to scraping the LPA portal if the Planning Portal API
 * doesn't have detailed status.
 */
export async function fetchApplicationStatus(
  reference: string,
  lpaCode: string,
  portalUrl?: string
): Promise<ApplicationStatus | null> {
  // Try Planning Portal API first
  const ppStatus = await fetchFromPlanningPortalApi(reference, lpaCode);
  if (ppStatus) return ppStatus;

  // Fall back to LPA portal scrape
  if (portalUrl) {
    return fetchFromLpaPortal(reference, lpaCode, portalUrl);
  }

  return null;
}

async function fetchFromPlanningPortalApi(
  reference: string,
  lpaCode: string
): Promise<ApplicationStatus | null> {
  try {
    // Planning Portal uses GOVUK API format
    const url = `https://api.planningportal.co.uk/search/applications?reference=${encodeURIComponent(reference)}&lpa=${encodeURIComponent(lpaCode)}`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "PlanningPerm/1.0",
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    const app = data?.results?.[0];
    if (!app) return null;

    return {
      reference,
      lpa_code: lpaCode,
      status: app.status || "Unknown",
      officer_assigned: app.case_officer || null,
      consultation_end_date: app.consultation_end_date || null,
      decision_due_date: app.target_date || null,
      objections_count: app.objections_count || 0,
      last_event: app.last_event || null,
      decision: app.decision || null,
      raw: app,
    };
  } catch {
    return null;
  }
}

async function fetchFromLpaPortal(
  reference: string,
  lpaCode: string,
  portalUrl: string
): Promise<ApplicationStatus | null> {
  try {
    // For Idox portals, search by application number
    const searchUrl = new URL(portalUrl.replace(/\/$/, "") + "/search.do");
    searchUrl.searchParams.set("action", "simple");
    searchUrl.searchParams.set("searchType", "Application");
    searchUrl.searchParams.set("searchText", reference);

    const resp = await fetch(searchUrl.toString(), {
      headers: { "User-Agent": "PlanningPerm/1.0" },
      next: { revalidate: 0 },
    });

    if (!resp.ok) return null;

    // Parse status from HTML using regex (avoids jsdom dependency)
    const html = await resp.text();
    const statusMatch = html.match(/data-label="Status"[^>]*>([^<]+)<|class="status-value"[^>]*>([^<]+)</);
    const officerMatch = html.match(/data-label="Case Officer"[^>]*>\s*<\/th>\s*<td[^>]*>([^<]+)</);

    return {
      reference,
      lpa_code: lpaCode,
      status: (statusMatch?.[1] || statusMatch?.[2] || "Unknown").trim(),
      officer_assigned: officerMatch?.[1]?.trim() || null,
      consultation_end_date: null,
      decision_due_date: null,
      objections_count: 0,
      last_event: null,
      decision: null,
      raw: {},
    };
  } catch {
    return null;
  }
}
