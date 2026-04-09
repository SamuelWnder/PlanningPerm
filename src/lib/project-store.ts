/**
 * Shared types and localStorage utility for saved projects.
 * Projects are stored client-side only — no backend required for the demo.
 */

export interface ProjectConstraints {
  is_listed: boolean;
  listed_grade: string | null;
  is_conservation: boolean;
  conservation_name: string | null;
  is_green_belt: boolean;
  is_flood_risk: boolean;
  flood_zone: string | null;
  is_article_4: boolean;
  is_aonb: boolean;
  // NHLE-sourced listed building fields (optional for backwards compat)
  nhle_name?: string | null;
  nhle_entry?: number | null;
  nhle_url?: string | null;
  // Extended designations (optional for backwards compat with stored projects)
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
  epc?: {
    found: boolean;
    property_type: string | null;
    built_form: string | null;
    construction_age_band: string | null;
    construction_year_min: number | null;
    total_floor_area: number | null;
    current_energy_rating: string | null;
    lodgement_date: string | null;
    address: string | null;
  } | null;
}

export interface StoredProject {
  address: string;
  council: string;
  lpa_code: string | null;
  projectTypeId: string;
  projectTypeLabel: string;
  propertyType: string;
  tenure: string;
  size: string;
  roof: string;
  material: string;
  timeline: string;
  description: string;
  latitude: number;
  longitude: number;
  constraints: ProjectConstraints | null;
  // Garage-specific
  garageAttachment?: string;
  garageUse?: string;
  // Tree-specific
  treeWorkType?: string;
  treeTPO?: string;
  treeDiameter?: string;
  // Change of use
  currentUse?: string;
  proposedUse?: string;
}

export interface AssessmentResult {
  score: number;
  verdict: string;
  risks: { title: string; severity: "high" | "medium" | "low"; detail: string }[];
  area_approval_rate: number | null;
  area_approval_rate_source: "official" | "none";
  area_approval_rate_label: string | null;
  area_approval_rate_caveat: string | null;
  summary: string;
}

export interface SavedProject {
  id: string;
  createdAt: string;
  project: StoredProject;
  assessment: AssessmentResult;
}

const STORAGE_KEY = "pp_projects";

function getAll(): SavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(project: StoredProject, assessment: AssessmentResult, existingId?: string): string {
  const id = existingId ?? crypto.randomUUID();
  // Don't duplicate if already saved with this id
  const all = getAll().filter((p) => p.id !== id);
  const entry: SavedProject = { id, createdAt: new Date().toISOString(), project, assessment };
  all.unshift(entry); // most recent first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return id;
}

function getById(id: string): SavedProject | null {
  return getAll().find((p) => p.id === id) ?? null;
}

function deleteById(id: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getAll().filter((p) => p.id !== id)));
}

export const projectStore = { getAll, save, getById, deleteById };
