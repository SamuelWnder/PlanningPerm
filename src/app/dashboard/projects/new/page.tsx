"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Home, FolderOpen, FileText, MapPin, Bell, User,
  ChevronLeft, ChevronRight, ArrowRight, Search,
  Check, Building2, Layers, TriangleRight,
  Home as HomeIcon, Trees, DoorOpen, Repeat2,
  LayoutGrid, Loader2, AlertTriangle, Lock,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface AddressSuggestion { text: string; uprn: string | null; }
interface ResolvedAddress {
  address: string; uprn: string | null;
  lpa_code: string | null; lpa_name: string | null;
  latitude: number; longitude: number;
}
interface ConstraintResult {
  is_listed: boolean; listed_grade: string | null;
  nhle_name: string | null; nhle_entry: number | null; nhle_url: string | null;
  is_conservation: boolean; conservation_name: string | null;
  is_green_belt: boolean; is_flood_risk: boolean; flood_zone: string | null;
  is_flood_storage_area: boolean;
  is_article_4: boolean; is_aonb: boolean;
  is_tree_preservation: boolean;
  is_ancient_woodland: boolean;
  is_scheduled_monument: boolean;
  is_sssi: boolean; sssi_name: string | null;
  is_national_park: boolean; national_park_name: string | null;
  is_sac: boolean; sac_name: string | null;
  is_spa: boolean; spa_name: string | null;
  is_ramsar: boolean; ramsar_name: string | null;
  is_historic_park: boolean; historic_park_name: string | null;
  is_world_heritage_site: boolean; world_heritage_site_name: string | null;
  is_world_heritage_buffer: boolean;
  is_heritage_at_risk: boolean;
  is_archaeological_priority: boolean;
  is_locally_listed: boolean;
  is_local_nature_reserve: boolean;
  epc: {
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

const PROJECT_TYPES = [
  { id: "rear-single",  label: "Single-storey rear extension",  icon: HomeIcon,      desc: "Kitchen, dining room or garden room added to the back"     },
  { id: "rear-double",  label: "Two-storey rear extension",     icon: Layers,        desc: "Adding two floors to the rear of the property"            },
  { id: "side",         label: "Side extension",                icon: LayoutGrid,    desc: "Extending to the side, single or two storey"              },
  { id: "loft",         label: "Loft conversion",               icon: TriangleRight, desc: "Converting the roof space, with or without a dormer"      },
  { id: "garage",       label: "Garage or outbuilding",         icon: Building2,     desc: "Detached garage, home office, studio or garden room"      },
  { id: "porch",        label: "Porch",                         icon: DoorOpen,      desc: "Covered entrance porch to the front or side"             },
  { id: "trees",        label: "Works to trees",                icon: Trees,         desc: "Pruning, felling or works near protected trees"           },
  { id: "change",       label: "Change of use",                 icon: Repeat2,       desc: "Converting a property to a different planning use class"  },
];

const TIMELINES = ["As soon as possible", "Within 3 months", "3–6 months", "6–12 months", "Just exploring"];

const USE_CLASSES = [
  "Residential (C3)",
  "Flat / HMO (C4)",
  "Office (Use Class E)",
  "Retail / café (Use Class E)",
  "Restaurant / bar (Use Class E)",
  "Light industrial (Use Class E)",
  "General industrial (B2)",
  "Storage / warehouse (B8)",
  "Other / sui generis",
];

type TypeKey = "rear-single" | "rear-double" | "side" | "loft" | "garage" | "porch" | "trees" | "change";

interface TypeConfig {
  showSize: boolean;
  sizes: string[];
  sizeLabel: string;
  showRoof: boolean;
  roofOptions: string[];
  showMaterials: boolean;
  materialOptions: string[];
  showGarageExtras: boolean;
  showTreeExtras: boolean;
  showChangeExtras: boolean;
  notesPlaceholder: string;
}

const TYPE_CONFIG: Record<TypeKey, TypeConfig> = {
  "rear-single": {
    showSize: true,
    sizes: ["Under 10m²", "10–20m²", "20–40m²", "Over 40m²"],
    sizeLabel: "How big is the extension?",
    showRoof: true,
    roofOptions: ["Flat roof", "Pitched roof", "Mono-pitch", "Green roof"],
    showMaterials: true,
    materialOptions: ["Brick to match", "Render", "Timber cladding", "Zinc / metal", "Glass"],
    showGarageExtras: false, showTreeExtras: false, showChangeExtras: false,
    notesPlaceholder: "e.g. Replacing an existing conservatory. Neighbour to the left has been consulted…",
  },
  "rear-double": {
    showSize: true,
    sizes: ["Under 20m²", "20–40m²", "40–60m²", "Over 60m²"],
    sizeLabel: "How big is the extension?",
    showRoof: true,
    roofOptions: ["Flat roof", "Pitched roof", "Mono-pitch"],
    showMaterials: true,
    materialOptions: ["Brick to match", "Render", "Timber cladding", "Zinc / metal"],
    showGarageExtras: false, showTreeExtras: false, showChangeExtras: false,
    notesPlaceholder: "e.g. Open-plan kitchen-diner across both floors, bedroom above on first floor…",
  },
  "side": {
    showSize: true,
    sizes: ["Under 10m²", "10–20m²", "20–40m²", "Over 40m²"],
    sizeLabel: "How big is the extension?",
    showRoof: true,
    roofOptions: ["Flat roof", "Pitched roof", "Mono-pitch"],
    showMaterials: true,
    materialOptions: ["Brick to match", "Render", "Timber cladding", "Zinc / metal"],
    showGarageExtras: false, showTreeExtras: false, showChangeExtras: false,
    notesPlaceholder: "e.g. Infilling a side return. The extension will be set back from the front elevation…",
  },
  "loft": {
    showSize: true,
    sizes: ["Under 20m²", "20–30m²", "30–50m²", "Over 50m²"],
    sizeLabel: "What floor area will the conversion add?",
    showRoof: true,
    roofOptions: ["Rear dormer", "Hip-to-gable", "Mansard", "Velux only (no dormer)"],
    showMaterials: true,
    materialOptions: ["Tiles to match", "Zinc / metal", "Rubber / felt", "Timber cladding"],
    showGarageExtras: false, showTreeExtras: false, showChangeExtras: false,
    notesPlaceholder: "e.g. Planning a rear dormer with a Juliet balcony. The hip end faces the road…",
  },
  "garage": {
    showSize: true,
    sizes: ["Under 15m²", "15–25m²", "25–40m²", "Over 40m²"],
    sizeLabel: "How big is the structure?",
    showRoof: true,
    roofOptions: ["Flat roof", "Pitched roof", "Mono-pitch", "Green roof"],
    showMaterials: true,
    materialOptions: ["Brick to match", "Render", "Timber cladding", "Zinc / metal"],
    showGarageExtras: true, showTreeExtras: false, showChangeExtras: false,
    notesPlaceholder: "e.g. Detached home office with WC at the end of the rear garden, fully insulated…",
  },
  "porch": {
    showSize: true,
    sizes: ["Under 2m²", "2–3m²", "3–5m²", "Over 5m²"],
    sizeLabel: "What is the footprint of the porch?",
    showRoof: true,
    roofOptions: ["Flat roof", "Pitched roof", "Mono-pitch", "Glass / polycarbonate"],
    showMaterials: true,
    materialOptions: ["Brick to match", "Render", "Timber", "uPVC", "Glass"],
    showGarageExtras: false, showTreeExtras: false, showChangeExtras: false,
    notesPlaceholder: "e.g. Replacing an existing canopy on the front elevation…",
  },
  "trees": {
    showSize: false, sizes: [], sizeLabel: "",
    showRoof: false, roofOptions: [],
    showMaterials: false, materialOptions: [],
    showGarageExtras: false, showTreeExtras: true, showChangeExtras: false,
    notesPlaceholder: "e.g. The oak has significant deadwood and is causing foundation damage. Crown-reduce by 30%…",
  },
  "change": {
    showSize: true,
    sizes: ["Under 50m²", "50–100m²", "100–250m²", "Over 250m²"],
    sizeLabel: "What is the total floor area of the space?",
    showRoof: false, roofOptions: [],
    showMaterials: false, materialOptions: [],
    showGarageExtras: false, showTreeExtras: false, showChangeExtras: true,
    notesPlaceholder: "e.g. Ground floor office vacant for 2 years, intend to convert to a single flat…",
  },
};

// ── Shared components ─────────────────────────────────────────────────────────
function HeroBg() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block", height: "100%", pointerEvents: "none" }}>
        <defs>
          <mask id="pnHeroMask">
            <rect fill="white" width="100%" height="50%" />
            <ellipse cx="50%" cy="0%" rx="150%" ry="100%" fill="white" />
          </mask>
          <linearGradient id="pnSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0e1e30" />
            <stop offset="30%"  stopColor="#1a3448" />
            <stop offset="60%"  stopColor="#2a5850" />
            <stop offset="85%"  stopColor="#3a6840" />
            <stop offset="100%" stopColor="#4a6038" />
          </linearGradient>
          <radialGradient id="pnSun" cx="68%" cy="32%" r="28%">
            <stop offset="0%"  stopColor="#d4922a" stopOpacity="0.5" />
            <stop offset="65%" stopColor="#d4922a" stopOpacity="0"   />
          </radialGradient>
          <linearGradient id="pnDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(8,18,32,0.78)" />
            <stop offset="45%"  stopColor="rgba(8,18,32,0.32)" />
            <stop offset="100%" stopColor="rgba(8,18,32,0)"    />
          </linearGradient>
        </defs>
        <rect fill="url(#pnSky)"  width="100%" height="100%" mask="url(#pnHeroMask)" />
        <rect fill="url(#pnSun)"  width="100%" height="100%" mask="url(#pnHeroMask)" />
        <rect fill="url(#pnDark)" width="100%" height="100%" mask="url(#pnHeroMask)" />
      </svg>
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 4, flex: 1, borderRadius: 2,
            background: i < step ? "rgb(55,176,170)" : "rgba(255,255,255,0.2)",
            transition: "background 0.4s",
          }}
        />
      ))}
    </div>
  );
}

// ── Pill selector button ───────────────────────────────────────────────────────
function PillBtn({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `2px solid ${selected ? "rgb(55,176,170)" : "rgb(226,240,240)"}`,
        borderRadius: 12, padding: "12px 20px",
        background: selected ? "rgba(55,176,170,0.06)" : "white",
        cursor: "pointer", fontSize: 15, fontWeight: 600,
        color: selected ? "rgb(55,176,170)" : "rgb(45,56,67)",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function NewProjectContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const TOTAL_STEPS  = 5;

  // Free-check gate
  const [gated, setGated] = useState<"loading" | "free" | "used">("loading");

  const [step, setStep]               = useState(1);
  const [addressQuery, setAddressQuery] = useState(searchParams.get("postcode") ?? "");
  const [suggestions, setSuggestions]   = useState<AddressSuggestion[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [resolved, setResolved]         = useState<ResolvedAddress | null>(null);
  const [constraints, setConstraints]   = useState<ConstraintResult | null>(null);
  const [constraintsLoading, setConstraintsLoading] = useState(false);

  // Step 2
  const [projectType, setProjectType] = useState("");

  // Step 3 — property details
  const [propertyType, setPropertyType] = useState("");
  const [tenure, setTenure]             = useState("");

  // Step 4 — project details (common)
  const [size, setSize]           = useState("");
  const [roof, setRoof]           = useState("");
  const [material, setMaterial]   = useState("");
  const [timeline, setTimeline]   = useState("");
  const [description, setDescription] = useState("");

  // Step 4 — garage extras
  const [garageAttachment, setGarageAttachment] = useState("");
  const [garageUse, setGarageUse]               = useState("");

  // Step 4 — tree extras
  const [treeWorkType, setTreeWorkType] = useState("");
  const [treeTPO, setTreeTPO]           = useState("");
  const [treeDiameter, setTreeDiameter] = useState("");

  // Step 4 — change of use extras
  const [currentUse, setCurrentUse]   = useState("");
  const [proposedUse, setProposedUse] = useState("");

  // Gate check + postcode pre-fill on mount
  useEffect(() => {
    const usedFree    = localStorage.getItem("pp_used_free_check") === "true";
    const hasPreview  = !!sessionStorage.getItem("pp_preview_data");
    // If they've used their free check AND have no active preview, show the gate
    setGated(usedFree && !hasPreview ? "used" : "free");

    const pc = searchParams.get("postcode");
    if (pc && pc.length >= 4) { handleAddressInput(pc); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset step-4 answers when project type changes
  useEffect(() => {
    setSize(""); setRoof(""); setMaterial("");
    setGarageAttachment(""); setGarageUse("");
    setTreeWorkType(""); setTreeTPO(""); setTreeDiameter("");
    setCurrentUse(""); setProposedUse("");
  }, [projectType]);

  const selectedType = PROJECT_TYPES.find((t) => t.id === projectType);
  const typeConfig   = TYPE_CONFIG[projectType as TypeKey] ?? TYPE_CONFIG["rear-single"];

  const canAdvance = (() => {
    if (step === 1) return resolved !== null;
    if (step === 2) return projectType !== "";
    if (step === 3) return propertyType !== "" && tenure !== "";
    if (step === 4) {
      if (!timeline) return false;
      if (typeConfig.showTreeExtras)   return treeWorkType !== "" && treeTPO !== "";
      if (typeConfig.showChangeExtras) return currentUse !== "" && proposedUse !== "";
      return size !== "";
    }
    return true;
  })();

  const next = () => { if (canAdvance) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const STEP_TITLES: Record<number, string> = {
    1: "What's the address?",
    2: "What are you planning to build?",
    3: "About your property",
    4: selectedType ? `Tell us about the ${selectedType.label.toLowerCase()}` : "Tell us a bit more",
    5: "Ready to run your check",
  };

  const handleAddressInput = useCallback(async (value: string) => {
    setAddressQuery(value);
    setResolved(null);
    setConstraints(null);
    if (value.length < 4) { setSuggestions([]); return; }
    setAddressLoading(true);
    try {
      const r = await fetch(`/api/address/autocomplete?q=${encodeURIComponent(value)}`);
      const d = await r.json();
      setSuggestions(d.results || []);
    } catch { setSuggestions([]); }
    finally { setAddressLoading(false); }
  }, []);

  const selectSuggestion = async (s: AddressSuggestion) => {
    setAddressQuery(s.text);
    setSuggestions([]);
    setConstraints(null);
    let lat = 0, lng = 0;
    let lpaCode: string | null = null, lpaName: string | null = null;
    if (s.uprn) {
      try {
        const r = await fetch(`/api/address/resolve?uprn=${s.uprn}`);
        const d = await r.json();
        lat = d.latitude ?? 0; lng = d.longitude ?? 0;
        lpaCode = d.lpa_code ?? null; lpaName = d.lpa_name ?? null;
      } catch { /* ignore */ }
    }
    setResolved({ address: s.text, uprn: s.uprn, lpa_code: lpaCode, lpa_name: lpaName, latitude: lat, longitude: lng });
    if (lat && lng) {
      setConstraintsLoading(true);
      try {
        const addressParam = encodeURIComponent(s.text);
        const r = await fetch(`/api/constraints?lat=${lat}&lng=${lng}&address=${addressParam}`);
        const d = await r.json();
        setConstraints({
          is_listed:              d.is_listed_building       ?? false,
          listed_grade:           d.listed_building_grade    ?? null,
          nhle_name:              d.nhle_name                ?? null,
          nhle_entry:             d.nhle_entry               ?? null,
          nhle_url:               d.nhle_url                 ?? null,
          is_conservation:        d.is_conservation_area     ?? false,
          conservation_name:      d.conservation_area_name   ?? null,
          is_green_belt:          d.is_green_belt             ?? false,
          is_flood_risk:          d.is_flood_risk              ?? false,
          flood_zone:             d.flood_risk_zone            ?? null,
          is_flood_storage_area:  d.is_flood_storage_area     ?? false,
          is_article_4:           d.is_article_4               ?? false,
          is_aonb:                d.is_aonb                    ?? false,
          is_tree_preservation:   d.is_tree_preservation       ?? false,
          is_ancient_woodland:    d.is_ancient_woodland        ?? false,
          is_scheduled_monument:  d.is_scheduled_monument      ?? false,
          is_sssi:                d.is_sssi                    ?? false,
          sssi_name:              d.sssi_name                  ?? null,
          is_national_park:       d.is_national_park           ?? false,
          national_park_name:     d.national_park_name         ?? null,
          is_sac:                 d.is_sac                     ?? false,
          sac_name:               d.sac_name                   ?? null,
          is_spa:                 d.is_spa                     ?? false,
          spa_name:               d.spa_name                   ?? null,
          is_ramsar:              d.is_ramsar                  ?? false,
          ramsar_name:            d.ramsar_name                ?? null,
          is_historic_park:       d.is_historic_park           ?? false,
          historic_park_name:     d.historic_park_name         ?? null,
          is_world_heritage_site: d.is_world_heritage_site     ?? false,
          world_heritage_site_name: d.world_heritage_site_name ?? null,
          is_world_heritage_buffer: d.is_world_heritage_buffer ?? false,
          is_heritage_at_risk:    d.is_heritage_at_risk        ?? false,
          is_archaeological_priority: d.is_archaeological_priority ?? false,
          is_locally_listed:      d.is_locally_listed          ?? false,
          is_local_nature_reserve: d.is_local_nature_reserve   ?? false,
          epc:                    d.epc                        ?? null,
        });
      } catch { setConstraints(null); }
      finally { setConstraintsLoading(false); }
    }
  };

  const CARD = {
    background: "white",
    borderRadius: 24,
    boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px",
  } as const;

  // ── Review rows helper ─────────────────────────────────────────────────────
  const reviewRows = (() => {
    const rows: { label: string; value: string }[] = [
      { label: "Property",     value: resolved?.address ?? "" },
      ...(resolved?.lpa_name ? [{ label: "Council",      value: resolved.lpa_name }] : []),
      { label: "Project type", value: selectedType?.label ?? "" },
      { label: "Property type", value: propertyType },
      { label: "Tenure",       value: tenure },
    ];
    if (typeConfig.showTreeExtras) {
      if (treeWorkType)  rows.push({ label: "Work type",     value: treeWorkType });
      if (treeTPO)       rows.push({ label: "TPO / CA status", value: treeTPO });
      if (treeDiameter)  rows.push({ label: "Trunk diameter", value: treeDiameter });
    } else if (typeConfig.showChangeExtras) {
      if (currentUse)    rows.push({ label: "Current use",   value: currentUse });
      if (proposedUse)   rows.push({ label: "Proposed use",  value: proposedUse });
      if (size)          rows.push({ label: "Floor area",    value: size });
    } else {
      if (size)          rows.push({ label: "Size",          value: size });
      if (typeConfig.showGarageExtras) {
        if (garageAttachment) rows.push({ label: "Structure",    value: garageAttachment });
        if (garageUse)        rows.push({ label: "Intended use", value: garageUse });
      }
      if (roof && typeConfig.showRoof)         rows.push({ label: "Roof type",  value: roof });
      if (material && typeConfig.showMaterials) rows.push({ label: "Materials", value: material });
    }
    rows.push({ label: "Timeline", value: timeline });
    if (description) rows.push({ label: "Notes", value: description });
    return rows;
  })();

  // ── Gate: loading state (avoids flash of form before localStorage is read)
  if (gated === "loading") return null;

  // ── Gate: used their free check, no active preview
  if (gated === "used") {
    return (
      <div style={{ fontFamily: '"Euclid Circular B","Helvetica Neue",Arial,sans-serif', minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgb(11,29,40)", padding: 24, textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: "#D4922A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "white" }}>PP</span>
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(212,150,42,0.15)", border: "1px solid rgba(212,150,42,0.35)", borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
          <Lock size={12} color="#D4922A" strokeWidth={2.5} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#D4922A" }}>Free check used</span>
        </div>

        <h1 style={{ fontSize: 34, fontWeight: 700, color: "white", margin: "0 0 14px 0", letterSpacing: -0.5, maxWidth: 440, lineHeight: 1.2 }}>
          You&apos;ve used your free planning check
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", margin: "0 0 36px 0", maxWidth: 420, lineHeight: 1.7 }}>
          Each full address check includes a score, site constraints and a detailed risk assessment. Get the full report for your previous property, or pay £20 to check a new one.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 380 }}>
          <Link
            href="/dashboard/projects/preview"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#D4922A", color: "white", borderRadius: 14, padding: "16px 24px", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 0 24px rgba(212,150,42,0.35)" }}
          >
            View your existing preview <ArrowRight size={17} strokeWidth={2.5} />
          </Link>

          <button
            onClick={async () => {
              const address = (() => {
                try {
                  const raw = sessionStorage.getItem("pp_new_project");
                  return raw ? (JSON.parse(raw) as { address: string }).address : "your property";
                } catch { return "your property"; }
              })();
              const res = await fetch("/api/stripe/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address }),
              });
              const { url } = await res.json();
              if (url) window.location.href = url;
            }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.18)", color: "white", borderRadius: 14, padding: "15px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
          >
            Unlock full report for current check — £20
          </button>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, marginTop: 4 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", margin: "0 0 10px 0" }}>Or check a different property</p>
            <button
              onClick={async () => {
                // Allow a new check — clear the flag and preview so they can start fresh
                // But gate again behind Stripe if they actually want the report
                localStorage.removeItem("pp_used_free_check");
                sessionStorage.removeItem("pp_preview_data");
                sessionStorage.removeItem("pp_new_project");
                setGated("free");
              }}
              style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
            >
              Run a new check (uses your one free search)
            </button>
          </div>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", marginTop: 32 }}>
          One free preview per device · Full reports £20 each · No subscription
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: '"Euclid Circular B","Helvetica Neue",Arial,sans-serif', background: "rgb(234,245,245)", minHeight: "100vh" }}>

      <main>
        {/* ══ HERO ════════════════════════════════════════════════════════ */}
        <section style={{ position: "relative", overflow: "hidden", paddingTop: 68, minHeight: 240 }}>
          <HeroBg />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "44px 64px 88px" }}>
            <Link href="/dashboard/projects" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 15, fontWeight: 500, marginBottom: 28 }}>
              <ChevronLeft size={16} strokeWidth={2} /> Back to projects
            </Link>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Step {step} of {TOTAL_STEPS}
                </p>
                <h1 style={{ fontSize: 36, fontWeight: 400, color: "white", margin: 0, letterSpacing: -0.5, fontFamily: "'Clash Display', sans-serif" }}>
                  {STEP_TITLES[step]}
                </h1>
              </div>
            </div>
            <ProgressBar step={step} total={TOTAL_STEPS} />
          </div>
          <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, zIndex: 2, lineHeight: 0, pointerEvents: "none" }}>
            <svg viewBox="0 0 1440 80" preserveAspectRatio="none" width="100%" height="80">
              <path d="M0,0 Q360,80 720,40 Q1080,0 1440,60 L1440,80 L0,80 Z" fill="rgb(234,245,245)" />
            </svg>
          </div>
        </section>

        {/* ══ STEP CONTENT ════════════════════════════════════════════════ */}
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 64px 80px" }}>

          {/* ── Step 1: Address ─────────────────────────────────────────── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ ...CARD, padding: "32px" }}>
                <p style={{ fontSize: 16, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>
                  Enter the full address or postcode of the property you want to check
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgb(234,245,245)", borderRadius: 14, padding: "0 18px", marginBottom: suggestions.length > 0 ? 0 : 16 }}>
                  <Search size={20} color="rgb(130,150,160)" strokeWidth={1.8} style={{ flexShrink: 0 }} />
                  <input
                    value={addressQuery}
                    onChange={(e) => handleAddressInput(e.target.value)}
                    placeholder="Start typing your address or postcode…"
                    autoComplete="off"
                    autoFocus
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 17, color: "rgb(11,29,40)", background: "transparent", padding: "18px 0", fontFamily: "inherit" }}
                  />
                  {addressLoading && <Loader2 size={18} color="rgb(130,150,160)" style={{ flexShrink: 0, animation: "spin 1s linear infinite" }} />}
                </div>
                {suggestions.length > 0 && (
                  <div style={{ border: "1px solid rgb(226,240,240)", borderTop: "none", borderRadius: "0 0 14px 14px", overflow: "hidden", marginBottom: 16 }}>
                    {suggestions.slice(0, 6).map((s, i) => (
                      <button
                        key={i}
                        onClick={() => selectSuggestion(s)}
                        style={{ width: "100%", textAlign: "left", background: "white", border: "none", borderBottom: i < Math.min(suggestions.length, 6) - 1 ? "1px solid rgb(240,246,246)" : "none", padding: "13px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                      >
                        <MapPin size={15} color="rgb(130,150,160)" strokeWidth={1.8} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 15, color: "rgb(45,56,67)" }}>{s.text}</span>
                      </button>
                    ))}
                  </div>
                )}
                {resolved && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(55,176,170,0.08)", border: "1.5px solid rgba(55,176,170,0.3)", borderRadius: 14, padding: "14px 18px", marginBottom: 12 }}>
                    <Check size={20} color="rgb(55,176,170)" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 2px 0" }}>{resolved.address}</p>
                      {resolved.lpa_name && <p style={{ fontSize: 13, color: "rgb(100,120,130)", margin: "0 0 10px 0" }}>{resolved.lpa_name}</p>}
                      {constraintsLoading && (
                        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgb(100,120,130)" }}>
                          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                          <span style={{ fontSize: 13 }}>Checking planning constraints…</span>
                        </div>
                      )}
                      {constraints && !constraintsLoading && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                          {[
                            { show: constraints.is_listed,              label: `Listed building${constraints.listed_grade ? ` (Grade ${constraints.listed_grade})` : ""}${constraints.nhle_name ? ` — ${constraints.nhle_name}` : ""}`, severe: true  },
                            { show: constraints.is_conservation,        label: constraints.conservation_name || "Conservation area",                                        severe: false },
                            { show: constraints.is_locally_listed,      label: "Locally listed building",                                                                  severe: false },
                            { show: constraints.is_heritage_at_risk,    label: "Heritage at risk",                                                                         severe: false },
                            { show: constraints.is_green_belt,          label: "Green belt",                                                                               severe: true  },
                            { show: constraints.is_flood_risk,          label: `Flood zone ${constraints.flood_zone || ""}`.trim(),                                        severe: false },
                            { show: constraints.is_article_4,           label: "Article 4 direction",                                                                      severe: false },
                            { show: constraints.is_aonb,                label: "AONB",                                                                                     severe: false },
                            { show: constraints.is_national_park,       label: constraints.national_park_name || "National Park",                                          severe: false },
                            { show: constraints.is_tree_preservation,   label: "Tree Preservation Order",                                                                  severe: false },
                            { show: constraints.is_ancient_woodland,    label: "Ancient woodland",                                                                         severe: true  },
                            { show: constraints.is_scheduled_monument,  label: "Scheduled monument",                                                                       severe: true  },
                            { show: constraints.is_archaeological_priority, label: "Archaeological priority area",                                                         severe: false },
                            { show: constraints.is_sssi,                label: constraints.sssi_name || "SSSI",                                                            severe: true  },
                            { show: constraints.is_sac,                 label: constraints.sac_name || "Special Area of Conservation",                                    severe: true  },
                            { show: constraints.is_spa,                 label: constraints.spa_name || "Special Protection Area",                                         severe: true  },
                            { show: constraints.is_ramsar,              label: constraints.ramsar_name || "Ramsar site",                                                   severe: true  },
                            { show: constraints.is_historic_park,       label: constraints.historic_park_name || "Registered Historic Park",                               severe: false },
                            { show: constraints.is_world_heritage_site, label: constraints.world_heritage_site_name || "World Heritage Site",                             severe: true  },
                            { show: constraints.is_world_heritage_buffer && !constraints.is_world_heritage_site, label: "WHS buffer zone",                                severe: false },
                            { show: constraints.is_local_nature_reserve ?? false, label: "Local Nature Reserve",                                              severe: false },
                          ].filter((c) => c.show).map((c, i) => (
                            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: c.severe ? "rgba(200,60,50,0.08)" : "rgba(212,150,42,0.10)", border: `1px solid ${c.severe ? "rgba(200,60,50,0.25)" : "rgba(212,150,42,0.25)"}`, borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 600, color: c.severe ? "rgb(160,40,30)" : "rgb(140,90,10)" }}>
                              <AlertTriangle size={11} strokeWidth={2} />{c.label}
                            </span>
                          ))}
                          {!constraints.is_listed && !constraints.is_conservation && !constraints.is_green_belt && !constraints.is_flood_risk && !constraints.is_aonb && !constraints.is_national_park && !constraints.is_sssi && !constraints.is_sac && !constraints.is_spa && !constraints.is_ramsar && !constraints.is_scheduled_monument && !constraints.is_world_heritage_site && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(55,176,170,0.10)", border: "1px solid rgba(55,176,170,0.25)", borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 600, color: "rgb(30,110,105)" }}>
                              <Check size={11} strokeWidth={2.5} /> No major constraints detected
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ ...CARD, padding: "24px 28px" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "rgb(100,120,130)", margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>20 checks run automatically against national planning data</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    "Conservation area", "Listed building", "Locally listed building",
                    "Heritage at risk", "Green belt", "Flood zone (EA verified)",
                    "Article 4 direction", "AONB", "National Park",
                    "Tree Preservation Order", "Ancient woodland", "Scheduled monument",
                    "Archaeological priority", "SSSI", "Special Area of Conservation",
                    "Special Protection Area", "Ramsar site", "Registered Historic Park",
                    "World Heritage Site", "Local Nature Reserve",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgb(55,176,170)", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "rgb(60,80,90)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

          {/* ── Step 2: Project type ─────────────────────────────────────── */}
          {step === 2 && (
            <div style={{ ...CARD, padding: "32px" }}>
              <p style={{ fontSize: 16, color: "rgb(100,120,130)", margin: "0 0 24px 0" }}>Select the type of work you&apos;re planning</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {PROJECT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const selected = projectType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setProjectType(type.id)}
                      style={{ textAlign: "left", border: `2px solid ${selected ? "rgb(55,176,170)" : "rgb(226,240,240)"}`, borderRadius: 16, padding: "18px 20px", background: selected ? "rgba(55,176,170,0.06)" : "white", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14, transition: "all 0.15s" }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: selected ? "rgb(55,176,170)" : "rgb(234,245,245)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
                        <Icon size={20} color={selected ? "white" : "rgb(100,120,130)"} strokeWidth={1.8} />
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 3px 0" }}>{type.label}</p>
                        <p style={{ fontSize: 13, color: "rgb(100,120,130)", margin: 0, lineHeight: 1.4 }}>{type.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 3: Property details ─────────────────────────────────── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Property type */}
              <div style={{ ...CARD, padding: "28px 32px" }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>What type of property is it?</p>
                <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>Affects permitted development rights and planning rules</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { id: "Detached house",    desc: "Free-standing on all sides" },
                    { id: "Semi-detached",      desc: "Shares one party wall" },
                    { id: "Mid-terrace",        desc: "Walls on both sides" },
                    { id: "End-of-terrace",     desc: "One side attached" },
                    { id: "Flat / apartment",   desc: "Usually no PD rights" },
                    { id: "Maisonette",         desc: "Multi-floor flat" },
                    { id: "Bungalow",           desc: "Single-storey house" },
                    { id: "Other",              desc: "Listed, barn, other" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setPropertyType(opt.id)}
                      style={{ textAlign: "left", border: `2px solid ${propertyType === opt.id ? "rgb(55,176,170)" : "rgb(226,240,240)"}`, borderRadius: 14, padding: "16px 18px", background: propertyType === opt.id ? "rgba(55,176,170,0.06)" : "white", cursor: "pointer", transition: "all 0.15s" }}
                    >
                      <p style={{ fontSize: 15, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 2px 0" }}>{opt.id}</p>
                      <p style={{ fontSize: 13, color: "rgb(100,120,130)", margin: 0 }}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tenure */}
              <div style={{ ...CARD, padding: "28px 32px" }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>What is the ownership status?</p>
                <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>Leasehold properties may need landlord consent in addition to planning</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    { id: "Owner-occupied (freehold)", note: "" },
                    { id: "Leasehold",                 note: "Landlord consent likely needed" },
                    { id: "Rented / tenancy",          note: "Landlord permission required" },
                    { id: "Other / not sure",          note: "" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTenure(opt.id)}
                      style={{ textAlign: "left", border: `2px solid ${tenure === opt.id ? "rgb(55,176,170)" : "rgb(226,240,240)"}`, borderRadius: 14, padding: "14px 18px", background: tenure === opt.id ? "rgba(55,176,170,0.06)" : "white", cursor: "pointer", transition: "all 0.15s" }}
                    >
                      <p style={{ fontSize: 15, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 2px 0" }}>{opt.id}</p>
                      {opt.note && <p style={{ fontSize: 12, color: "rgb(140,90,10)", margin: 0 }}>{opt.note}</p>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Project details (context-sensitive) ───────────────── */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Tree-specific questions */}
              {typeConfig.showTreeExtras && (
                <>
                  <div style={{ ...CARD, padding: "28px 32px" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>What type of work are you planning?</p>
                    <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>Select the main type of work</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {["Crown reduction", "Crown thinning", "Pollarding", "Felling", "Pruning / deadwooding", "Root works"].map((opt) => (
                        <PillBtn key={opt} label={opt} selected={treeWorkType === opt} onClick={() => setTreeWorkType(opt)} />
                      ))}
                    </div>
                  </div>

                  <div style={{ ...CARD, padding: "28px 32px" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>Is the tree protected?</p>
                    <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>TPO trees and trees in conservation areas require consent before any work</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {["Yes — Tree Preservation Order (TPO)", "Yes — in a conservation area", "Not sure", "No — not protected"].map((opt) => (
                        <PillBtn key={opt} label={opt} selected={treeTPO === opt} onClick={() => setTreeTPO(opt)} />
                      ))}
                    </div>
                  </div>

                  <div style={{ ...CARD, padding: "28px 32px" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>Approximate trunk diameter at chest height</p>
                    <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>Helps determine the scale and significance of the tree</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      {["Under 30cm", "30–60cm", "Over 60cm", "Not sure"].map((opt) => (
                        <PillBtn key={opt} label={opt} selected={treeDiameter === opt} onClick={() => setTreeDiameter(opt)} />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Change of use questions */}
              {typeConfig.showChangeExtras && (
                <>
                  <div style={{ ...CARD, padding: "28px 32px" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>What is the current use?</p>
                    <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>The existing planning use class of the property</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {USE_CLASSES.map((opt) => (
                        <PillBtn key={opt} label={opt} selected={currentUse === opt} onClick={() => setCurrentUse(opt)} />
                      ))}
                    </div>
                  </div>

                  <div style={{ ...CARD, padding: "28px 32px" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>What is the proposed use?</p>
                    <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>The planning use class you want to convert to</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {USE_CLASSES.map((opt) => (
                        <PillBtn key={opt} label={opt} selected={proposedUse === opt} onClick={() => setProposedUse(opt)} />
                      ))}
                    </div>
                  </div>

                  <div style={{ ...CARD, padding: "28px 32px" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>What is the total floor area?</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                      {typeConfig.sizes.map((opt) => (
                        <PillBtn key={opt} label={opt} selected={size === opt} onClick={() => setSize(opt)} />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Standard questions (extensions, loft, garage, porch) */}
              {!typeConfig.showTreeExtras && !typeConfig.showChangeExtras && (
                <>
                  {typeConfig.showSize && (
                    <div style={{ ...CARD, padding: "28px 32px" }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>{typeConfig.sizeLabel}</p>
                      <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>Approximate floor area in square metres</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                        {typeConfig.sizes.map((opt) => (
                          <PillBtn key={opt} label={opt} selected={size === opt} onClick={() => setSize(opt)} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Garage extras: attachment + intended use */}
                  {typeConfig.showGarageExtras && (
                    <>
                      <div style={{ ...CARD, padding: "28px 32px" }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>Attached or detached?</p>
                        <div style={{ display: "flex", gap: 10 }}>
                          {["Attached to the main house", "Detached structure"].map((opt) => (
                            <PillBtn key={opt} label={opt} selected={garageAttachment === opt} onClick={() => setGarageAttachment(opt)} />
                          ))}
                        </div>
                      </div>
                      <div style={{ ...CARD, padding: "28px 32px" }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>What will it be used for?</p>
                        <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>Intended use affects planning classification</p>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {["Car storage / garage", "Home office", "Studio / gym", "Storage", "Annexe / guest room"].map((opt) => (
                            <PillBtn key={opt} label={opt} selected={garageUse === opt} onClick={() => setGarageUse(opt)} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {typeConfig.showRoof && (
                    <div style={{ ...CARD, padding: "28px 32px" }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>What roof type are you planning?</p>
                      <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>Affects permitted development limits and design policy</p>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {typeConfig.roofOptions.map((opt) => (
                          <PillBtn key={opt} label={opt} selected={roof === opt} onClick={() => setRoof(opt)} />
                        ))}
                      </div>
                    </div>
                  )}

                  {typeConfig.showMaterials && (
                    <div style={{ ...CARD, padding: "28px 32px" }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>Proposed external material</p>
                      <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>Councils assess whether materials match the character of the area</p>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {typeConfig.materialOptions.map((opt) => (
                          <PillBtn key={opt} label={opt} selected={material === opt} onClick={() => setMaterial(opt)} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Timeline — shown for all types */}
              <div style={{ ...CARD, padding: "28px 32px" }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>When are you hoping to start?</p>
                <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>Helps us prioritise what&apos;s most useful for you</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {TIMELINES.map((opt) => (
                    <PillBtn key={opt} label={opt} selected={timeline === opt} onClick={() => setTimeline(opt)} />
                  ))}
                </div>
              </div>

              {/* Notes — shown for all types */}
              <div style={{ ...CARD, padding: "28px 32px" }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>
                  Anything else we should know? <span style={{ fontSize: 15, fontWeight: 400, color: "rgb(130,150,160)" }}>Optional</span>
                </p>
                <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 16px 0" }}>Any specific concerns, constraints, or details about your project</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={typeConfig.notesPlaceholder}
                  rows={4}
                  style={{ width: "100%", border: "1.5px solid rgb(226,240,240)", borderRadius: 12, padding: "14px 16px", fontSize: 15, color: "rgb(45,56,67)", fontFamily: "inherit", resize: "vertical", outline: "none", background: "rgb(250,253,253)", boxSizing: "border-box" }}
                />
              </div>
            </div>
          )}

          {/* ── Step 5: Review ───────────────────────────────────────────── */}
          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div style={{ ...CARD, padding: "32px" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "rgb(100,120,130)", margin: "0 0 20px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Your project summary</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {reviewRows.map((row, i, arr) => (
                    <div key={i} style={{ display: "flex", gap: 20, padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid rgb(240,246,246)" : "none" }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "rgb(100,120,130)", margin: 0, width: 140, flexShrink: 0 }}>{row.label}</p>
                      <p style={{ fontSize: 15, color: "rgb(11,29,40)", margin: 0, lineHeight: 1.5 }}>{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...CARD, padding: "28px 32px" }}>
                <p style={{ fontSize: 17, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 16px 0" }}>What happens when you run the check</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { n: "1", text: "We check your address against national planning datasets — conservation areas, flood zones, listed buildings, TPOs, and more" },
                    { n: "2", text: "We cross-reference your project type against real decisions from your local planning authority" },
                    { n: "3", text: "We calculate your approval score, identify your risks, and draft your planning documents" },
                  ].map((item) => (
                    <div key={item.n} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgb(226,240,240)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "rgb(55,176,170)" }}>{item.n}</span>
                      </div>
                      <p style={{ fontSize: 15, color: "rgb(60,80,90)", margin: 0, lineHeight: 1.6 }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  const payload = {
                    address:          resolved?.address ?? addressQuery,
                    council:          resolved?.lpa_name ?? "",
                    lpa_code:         resolved?.lpa_code ?? null,
                    projectTypeId:    projectType,
                    projectTypeLabel: selectedType?.label ?? projectType,
                    propertyType,
                    tenure,
                    size,
                    roof,
                    material,
                    timeline,
                    description,
                    latitude:   resolved?.latitude  ?? 0,
                    longitude:  resolved?.longitude ?? 0,
                    constraints,
                    garageAttachment: garageAttachment || undefined,
                    garageUse:        garageUse        || undefined,
                    treeWorkType:     treeWorkType     || undefined,
                    treeTPO:          treeTPO          || undefined,
                    treeDiameter:     treeDiameter     || undefined,
                    currentUse:       currentUse       || undefined,
                    proposedUse:      proposedUse      || undefined,
                  };
                  sessionStorage.setItem("pp_new_project", JSON.stringify(payload));
                  sessionStorage.removeItem("pp_assessment_result");
                  sessionStorage.removeItem("pp_latest_project_id");
                  router.push("/dashboard/projects/generated");
                }}
                style={{ width: "100%", background: "#D4922A", color: "white", border: "none", borderRadius: 16, padding: "20px 32px", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#b87820")}
                onMouseLeave={e => (e.currentTarget.style.background = "#D4922A")}
              >
                Run my planning check
                <ArrowRight size={20} strokeWidth={2.5} />
              </button>
              <p style={{ fontSize: 13, color: "rgb(130,150,160)", textAlign: "center", margin: 0 }}>Takes about 90 seconds · No payment required</p>
            </div>
          )}

          {/* ── Navigation ──────────────────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28 }}>
            {step > 1 ? (
              <button
                onClick={back}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1.5px solid rgb(220,235,235)", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 500, color: "rgb(45,56,67)", cursor: "pointer" }}
              >
                <ChevronLeft size={17} strokeWidth={2} /> Back
              </button>
            ) : <div />}

            {step < TOTAL_STEPS && (
              <button
                onClick={next}
                disabled={!canAdvance}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: canAdvance ? "rgb(55,176,170)" : "rgb(200,220,220)",
                  color: canAdvance ? "white" : "rgb(150,170,170)",
                  border: "none", borderRadius: 12, padding: "13px 28px",
                  fontSize: 16, fontWeight: 600, cursor: canAdvance ? "pointer" : "not-allowed",
                  transition: "background 0.2s",
                }}
              >
                Continue <ChevronRight size={17} strokeWidth={2.5} />
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense>
      <NewProjectContent />
    </Suspense>
  );
}
