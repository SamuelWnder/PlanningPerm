"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home, FolderOpen, FileText, MapPin, Bell, User,
  ChevronLeft, CheckCircle, AlertTriangle, XCircle,
  FileSignature, Download, ArrowRight, Building2,
  TrendingUp, Zap, ShieldCheck, Trees, Landmark, Loader2, X, Mail, Trash2,
} from "lucide-react";
import { projectStore, type SavedProject, type StoredProject, type AssessmentResult } from "@/lib/project-store";

// ── Document types ────────────────────────────────────────────────────────────
const DOC_TYPE_MAP: Record<string, string> = {
  "Design & Access Statement": "design_access_statement",
  "Planning Statement":        "planning_statement",
  "Heritage Statement":        "heritage_statement",
  "Cover Letter":              "cover_letter",
};

type DocStatus = "generating" | "done" | "error";

function getDocuments(constraints: StoredProject["constraints"]) {
  const docs = [
    { name: "Design & Access Statement", canGenerate: true },
    { name: "Planning Statement",        canGenerate: true },
  ];
  if (constraints?.is_conservation || constraints?.is_listed) {
    docs.push({ name: "Heritage Statement", canGenerate: true });
  }
  docs.push({ name: "Cover Letter", canGenerate: true });
  return docs;
}

// ── Constraint helpers ────────────────────────────────────────────────────────
function buildConstraints(c: StoredProject["constraints"]) {
  if (!c) {
    return [
      { label: "Conservation area",            status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Listed building",              status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Locally listed building",      status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Heritage at risk",             status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Green belt",                   status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Flood zone",                   status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Article 4 direction",          status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "AONB / National Landscape",    status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "National Park",                status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Tree Preservation Order",      status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Ancient woodland",             status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Scheduled monument",           status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Archaeological priority area", status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "SSSI",                         status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Special Area of Conservation", status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Special Protection Area",      status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Ramsar site",                  status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Registered Historic Park",     status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "World Heritage Site",          status: "warn" as const, note: "Unable to verify — check with your council" },
      { label: "Local Nature Reserve",          status: "warn" as const, note: "Unable to verify — check with your council" },
    ];
  }
  return [
    { label: "Conservation area",            status: c.is_conservation ? "warn" as const : "pass" as const,           note: c.is_conservation ? `Within ${c.conservation_name ?? "a conservation area"}` : "Not within a conservation area" },
    { label: "Listed building",              status: c.is_listed ? "fail" as const : "pass" as const,                 note: c.is_listed ? `Grade ${c.listed_grade ?? "II"} — ${c.nhle_name ?? "listed building"}${c.nhle_entry ? ` (NHLE #${c.nhle_entry})` : ""}` : "Not listed (Historic England NHLE verified)" },
    { label: "Locally listed building",      status: c.is_locally_listed ? "warn" as const : "pass" as const,         note: c.is_locally_listed ? "Locally listed — council heritage policies apply" : "Not locally listed" },
    { label: "Heritage at risk",             status: c.is_heritage_at_risk ? "warn" as const : "pass" as const,       note: c.is_heritage_at_risk ? "On Historic England's at-risk register" : "Not on Heritage at Risk register" },
    { label: "Green belt",                   status: c.is_green_belt ? "fail" as const : "pass" as const,             note: c.is_green_belt ? "Within green belt land — significant constraint" : "Outside green belt land" },
    { label: "Flood zone",                   status: c.is_flood_risk ? (c.flood_zone === "3" ? "fail" as const : "warn" as const) : "pass" as const, note: c.is_flood_risk ? `Flood Zone ${c.flood_zone}${c.flood_zone === "3" ? " — Sequential Test required; Flood Risk Assessment likely needed" : " — drainage strategy may be required"}${c.is_flood_storage_area ? " (Flood Storage Area)" : ""}` : "Flood Zone 1 — low risk (Environment Agency verified)" },
    { label: "Article 4 direction",          status: c.is_article_4 ? "warn" as const : "pass" as const,              note: c.is_article_4 ? "Article 4 applies — permitted development rights restricted" : "No Article 4 restrictions apply" },
    { label: "AONB / National Landscape",    status: c.is_aonb ? "warn" as const : "pass" as const,                   note: c.is_aonb ? "Within Area of Outstanding Natural Beauty" : "Outside any AONB" },
    { label: "National Park",                status: c.is_national_park ? "warn" as const : "pass" as const,          note: c.is_national_park ? `Within ${c.national_park_name ?? "a National Park"}` : "Not within a National Park" },
    { label: "Tree Preservation Order",      status: c.is_tree_preservation ? "warn" as const : "pass" as const,      note: c.is_tree_preservation ? "TPO in place — consent required for tree works" : "No TPO detected at this location" },
    { label: "Ancient woodland",             status: c.is_ancient_woodland ? "fail" as const : "pass" as const,       note: c.is_ancient_woodland ? "Ancient woodland nearby — buffer zone policy applies" : "No ancient woodland nearby" },
    { label: "Scheduled monument",           status: c.is_scheduled_monument ? "fail" as const : "pass" as const,     note: c.is_scheduled_monument ? "Scheduled monument — Historic England consent required" : "No scheduled monuments at this location" },
    { label: "Archaeological priority area", status: c.is_archaeological_priority ? "warn" as const : "pass" as const, note: c.is_archaeological_priority ? "Desk-based archaeological assessment likely required" : "No archaeological priority designation" },
    { label: "SSSI",                         status: c.is_sssi ? "fail" as const : "pass" as const,                   note: c.is_sssi ? `SSSI: ${c.sssi_name ?? "present"} — Natural England must be consulted` : "No SSSI at this location" },
    { label: "Special Area of Conservation", status: c.is_sac ? "fail" as const : "pass" as const,                    note: c.is_sac ? `SAC: ${c.sac_name ?? "present"} — Habitats Regulations Assessment required` : "No SAC designation" },
    { label: "Special Protection Area",      status: c.is_spa ? "fail" as const : "pass" as const,                    note: c.is_spa ? `SPA: ${c.spa_name ?? "present"} — bird protection; HRA required` : "No SPA designation" },
    { label: "Ramsar site",                  status: c.is_ramsar ? "fail" as const : "pass" as const,                  note: c.is_ramsar ? `Ramsar: ${c.ramsar_name ?? "present"} — treated as SPA for planning purposes` : "No Ramsar designation" },
    { label: "Registered Historic Park",     status: c.is_historic_park ? "warn" as const : "pass" as const,          note: c.is_historic_park ? `${c.historic_park_name ?? "Registered park"} — Historic England designation` : "No registered historic park" },
    { label: "World Heritage Site",          status: c.is_world_heritage_site ? "fail" as const : c.is_world_heritage_buffer ? "warn" as const : "pass" as const, note: c.is_world_heritage_site ? `UNESCO WHS: ${c.world_heritage_site_name ?? "present"} — highest heritage protection` : c.is_world_heritage_buffer ? "Within UNESCO WHS buffer zone" : "No World Heritage Site designation" },
    { label: "Local Nature Reserve",          status: c.is_local_nature_reserve ? "warn" as const : "pass" as const, note: c.is_local_nature_reserve ? "Within or adjacent to a Local Nature Reserve" : "No Local Nature Reserve designation" },
  ];
}

function buildCosts(projectTypeId: string, constraints: StoredProject["constraints"]) {
  const buildCost: Record<string, string> = {
    "rear-single": "£30,000 – £55,000",
    "rear-double": "£55,000 – £90,000",
    "side":        "£35,000 – £60,000",
    "loft":        "£40,000 – £75,000",
    "garage":      "£15,000 – £35,000",
    "porch":       "£5,000 – £15,000",
    "trees":       "£800 – £5,000",
    "change":      "£20,000 – £80,000",
  };
  const isHeritage = constraints?.is_conservation || constraints?.is_listed;
  const items: { label: string; value: string; note?: string; highlight?: boolean; included?: boolean }[] = [
    { label: "Planning documents",       value: "Included", note: "Design & Access Statement, Planning Statement, Cover Letter — generated above", included: true },
    { label: "Planning application fee", value: "£528",     note: "Fixed government fee, paid directly to the council" },
    { label: "Architectural drawings",   value: isHeritage ? "£2,500 – £5,000" : "£1,500 – £3,000", note: isHeritage ? "Plans, elevations & sections — higher due to heritage context" : "Plans, elevations & sections from a local architect" },
  ];
  if (isHeritage) {
    items.push({ label: "Heritage specialist",    value: "£500 – £1,500", note: "Required for conservation area or listed building applications" });
    items.push({ label: "Pre-application advice", value: "£300 – £600",   note: "Strongly recommended before submitting in a heritage-sensitive area" });
    items.push({ label: "Total to submission",    value: "£4,800 – £8,600", highlight: true });
  } else {
    items.push({ label: "Total to submission",    value: "£2,050 – £4,100", highlight: true });
  }
  items.push({ label: "Indicative build cost", value: buildCost[projectTypeId] ?? "£25,000 – £60,000" });
  return items;
}

// ── Visual helpers ────────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 70) return "rgb(55,176,170)";
  if (s >= 50) return "rgb(212,150,42)";
  return "rgb(200,60,60)";
}

function constraintIcon(label: string) {
  const map: Record<string, React.ReactNode> = {
    "Conservation area":         <Landmark size={18} color="rgb(130,150,160)" strokeWidth={1.8} />,
    "Listed building":           <ShieldCheck size={18} color="rgb(130,150,160)" strokeWidth={1.8} />,
    "Green belt":                <Trees size={18} color="rgb(130,150,160)" strokeWidth={1.8} />,
    "Flood zone":                <Zap size={18} color="rgb(130,150,160)" strokeWidth={1.8} />,
    "Article 4 direction":       <AlertTriangle size={18} color="rgb(130,150,160)" strokeWidth={1.8} />,
    "AONB / National Landscape": <MapPin size={18} color="rgb(130,150,160)" strokeWidth={1.8} />,
  };
  return map[label] ?? <MapPin size={18} color="rgb(130,150,160)" strokeWidth={1.8} />;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "pass") return <CheckCircle size={18} color="rgb(55,176,170)" strokeWidth={2} />;
  if (status === "fail") return <XCircle size={18} color="rgb(200,60,60)" strokeWidth={2} />;
  return <AlertTriangle size={18} color="rgb(212,150,42)" strokeWidth={2} />;
}

function PulsingDot() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgb(55,176,170)", display: "inline-block", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
      <style>{`@keyframes pulse { 0%,80%,100%{opacity:0.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }`}</style>
    </span>
  );
}

function ScoreDonut({ score }: { score: number }) {
  const size = 220; const r = 88;
  const circ = 2 * Math.PI * r;
  const arc = 0.75;
  const filled = (score / 100) * arc * circ;
  const track = arc * circ;
  const gap = circ - track;
  const color = scoreColor(score);
  const label = score >= 70 ? "Likely Approved" : score >= 50 ? "Borderline" : score >= 35 ? "At risk" : "Likely Refused";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1.5px solid rgba(255,255,255,0.18)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, transform: "rotate(135deg)", pointerEvents: "none" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={10} strokeDasharray={`${track} ${gap}`} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${filled} ${circ - filled}`} />
      </svg>
      <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.55)", margin: "0 0 2px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>Score</p>
      <p style={{ fontSize: 52, fontWeight: 700, color: "white", margin: 0, lineHeight: 1, letterSpacing: -2 }}>{score}</p>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 8px 0" }}>/ 100</p>
      <div style={{ background: `${color}22`, borderRadius: 16000, padding: "5px 14px", border: `1px solid ${color}55` }}>
        <p style={{ fontSize: 12, fontWeight: 700, color, margin: 0 }}>{label}</p>
      </div>
    </div>
  );
}

// ── Document viewer modal ─────────────────────────────────────────────────────
function DocViewerModal({ name, html, onClose }: { name: string; html: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const [pdfLoading, setPdfLoading] = useState(false);

  const downloadPdf = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      // Lazy-load via a single setup module so CJS font side-effects fire correctly
      const [{ pdfMake }, { default: htmlToPdfmake }] = await Promise.all([
        import("@/lib/pdfmake-setup"),
        import("html-to-pdfmake"),
      ]);

      // Convert the document HTML into pdfmake content nodes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content = htmlToPdfmake(html) as any;

      const docDefinition = {
        content,
        defaultStyle: { font: "Roboto", fontSize: 11, lineHeight: 1.5 },
        styles: {
          "html-h2": { fontSize: 14, bold: true, color: "#0b1d28", marginTop: 18, marginBottom: 6 },
          "html-p":  { fontSize: 11, color: "#1a2e3a", marginBottom: 8 },
          "html-li": { fontSize: 11, color: "#1a2e3a" },
          "html-strong": { bold: true },
        },
        pageMargins: [60, 60, 60, 60] as [number, number, number, number],
        info: { title: name, author: "PlanningPerm" },
      };

      pdfMake.createPdf(docDefinition).download(`${name}.pdf`);
    } catch (e) {
      console.error("[pdf]", e);
      alert("PDF generation failed — please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 760, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid rgb(234,245,245)", flexShrink: 0 }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: "rgb(11,29,40)", margin: 0 }}>{name}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={downloadPdf} disabled={pdfLoading} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: pdfLoading ? "rgba(11,29,40,0.5)" : "rgb(11,29,40)", border: "none", cursor: pdfLoading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, color: "white" }}>
              {pdfLoading
                ? <><Loader2 size={13} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} /> Generating…</>
                : <><Download size={13} strokeWidth={2} /> Download</>}
            </button>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgb(234,245,245)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={15} color="rgb(60,80,90)" strokeWidth={2} />
            </button>
          </div>
        </div>
        <div className="doc-viewer-body" style={{ padding: "28px 36px", overflowY: "auto", flex: 1, fontSize: 15, lineHeight: 1.75, color: "rgb(30,45,55)", fontFamily: '"Rethink Sans","Helvetica Neue",Arial,sans-serif' }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

// ── Lead capture ──────────────────────────────────────────────────────────────
function LeadCapture({ address }: { address: string }) {
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent]   = useState(false);

  const submit = () => {
    if (!email.trim()) return;
    const leads = JSON.parse(localStorage.getItem("pp_leads") ?? "[]");
    leads.push({ name, email, phone, address, submittedAt: new Date().toISOString() });
    localStorage.setItem("pp_leads", JSON.stringify(leads));
    setSent(true);
  };

  const INPUT = { width: "100%", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", fontSize: 15, color: "white", background: "rgba(255,255,255,0.07)", fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const };

  return (
    <div style={{ background: "rgb(11,29,40)", borderRadius: 24, padding: "40px 48px", display: "flex", gap: 56, alignItems: "center", boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px" }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "rgb(55,176,170)", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Get expert help</p>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "white", margin: "0 0 12px 0", letterSpacing: -0.5 }}>Speak to a planning consultant</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.65 }}>
          A qualified UK planning consultant will review your assessment and advise on the best route to approval. Free 15-minute call, no obligation.
        </p>
      </div>
      <div style={{ flex: "0 0 360px" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircle size={40} color="rgb(55,176,170)" strokeWidth={1.5} style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 18, fontWeight: 700, color: "white", margin: "0 0 8px 0" }}>We&apos;ll be in touch</p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", margin: 0 }}>Expect a call within 1 business day.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} style={INPUT} />
            <input placeholder="Email address *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={INPUT} />
            <input placeholder="Phone (optional)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={INPUT} />
            <button
              onClick={submit}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: email.trim() ? "rgb(55,176,170)" : "rgba(55,176,170,0.3)", color: "white", border: "none", borderRadius: 10, padding: "13px 20px", fontSize: 15, fontWeight: 600, cursor: email.trim() ? "pointer" : "not-allowed", transition: "background 0.2s", marginTop: 2 }}
            >
              <Mail size={15} strokeWidth={2} /> Request a free consultation
            </button>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: "2px 0 0 0", textAlign: "center" }}>No spam. Your details stay private.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Card style ────────────────────────────────────────────────────────────────
const CARD = { background: "white", borderRadius: 24, padding: "28px 32px", boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px" };

function HeroBg() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block", height: "100%", pointerEvents: "none" }}>
        <defs>
          <linearGradient id="id-hero-g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="rgb(11,29,40)"  />
            <stop offset="100%" stopColor="rgb(22,58,80)"  />
          </linearGradient>
          <radialGradient id="id-hero-g2" cx="75%" cy="40%" r="55%">
            <stop offset="0%"   stopColor="rgba(55,176,170,0.28)" />
            <stop offset="100%" stopColor="rgba(55,176,170,0)"    />
          </radialGradient>
          <radialGradient id="id-hero-g3" cx="15%" cy="70%" r="45%">
            <stop offset="0%"   stopColor="rgba(212,150,42,0.18)" />
            <stop offset="100%" stopColor="rgba(212,150,42,0)"    />
          </radialGradient>
        </defs>
        <rect fill="url(#id-hero-g1)" width="100%" height="100%" />
        <rect fill="url(#id-hero-g2)" width="100%" height="100%" />
        <rect fill="url(#id-hero-g3)" width="100%" height="100%" />
      </svg>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProjectResultPage() {
  const { id } = useParams<{ id: string }>();
  const router   = useRouter();

  const [saved, setSaved] = useState<SavedProject | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [confirmDelete, setConfirmDelete]       = useState(false);
  const [expandedConstraint, setExpandedConstraint] = useState<string | null>(null);

  const [docStatuses, setDocStatuses] = useState<Record<string, DocStatus>>({});
  const [docContents, setDocContents] = useState<Record<string, string>>({});
  const [viewingDoc, setViewingDoc]   = useState<{ name: string; html: string } | null>(null);
  const generatingRef = useRef<Set<string>>(new Set());

  // Persist generated doc HTML so refreshes don't re-call the API
  const docCacheKey = id ? `pp_docs_${id}` : null;

  function loadCachedDocs(): Record<string, string> {
    if (!docCacheKey) return {};
    try { return JSON.parse(localStorage.getItem(docCacheKey) ?? "{}"); } catch { return {}; }
  }

  function saveCachedDoc(docName: string, html: string) {
    if (!docCacheKey) return;
    try {
      const existing = loadCachedDocs();
      localStorage.setItem(docCacheKey, JSON.stringify({ ...existing, [docName]: html }));
    } catch { /* storage full — ignore */ }
  }

  const generateDoc = useCallback(async (docName: string, proj: StoredProject) => {
    const docType = DOC_TYPE_MAP[docName];
    if (!docType || generatingRef.current.has(docName)) return;
    generatingRef.current.add(docName);
    setDocStatuses((s) => ({ ...s, [docName]: "generating" }));
    try {
      const res = await fetch("/api/dashboard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address:       proj.address,
          council:       proj.council,
          projectType:   proj.projectTypeLabel,
          propertyType:  proj.propertyType,
          tenure:        proj.tenure,
          size:          proj.size,
          roof:          proj.roof,
          material:      proj.material,
          description:   proj.description,
          documentType:  docType,
          applicantName: sessionStorage.getItem("pp_lead_name") ?? "",
        }),
      });
      const data = await res.json();
      if (data.content) {
        setDocContents((c) => ({ ...c, [docName]: data.content }));
        setDocStatuses((s) => ({ ...s, [docName]: "done" }));
        saveCachedDoc(docName, data.content);
      } else {
        setDocStatuses((s) => ({ ...s, [docName]: "error" }));
      }
    } catch {
      setDocStatuses((s) => ({ ...s, [docName]: "error" }));
    } finally {
      generatingRef.current.delete(docName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docCacheKey]);

  useEffect(() => {
    if (!id) return;

    async function load() {
      // 1. Try localStorage first (fast, works offline)
      const localEntry = projectStore.getById(id!);
      if (localEntry) {
        setSaved(localEntry);
        const docs = getDocuments(localEntry.project.constraints);
        // Restore any previously generated docs from cache
        const cached = loadCachedDocs();
        const restoredStatuses: Record<string, DocStatus> = {};
        const restoredContents: Record<string, string> = {};
        docs.forEach((doc) => {
          if (cached[doc.name]) {
            restoredContents[doc.name] = cached[doc.name];
            restoredStatuses[doc.name] = "done";
          }
        });
        if (Object.keys(restoredContents).length > 0) {
          setDocContents(restoredContents);
          setDocStatuses(restoredStatuses);
        }
        // Only generate docs that aren't already cached
        const missing = docs.filter((doc) => !cached[doc.name]);
        missing.forEach((doc, i) => { setTimeout(() => generateDoc(doc.name, localEntry.project), i * 1200); });
        return;
      }

      // 2. Fall back to Supabase (cross-device via magic link)
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Check if we have an authenticated session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) { setNotFound(true); return; }

        // Fetch from Supabase by project UUID and user email
        const { data, error } = await supabase
          .from("projects")
          .select("id, project_data, assessment_data, created_at")
          .eq("id", id)
          .eq("user_email", session.user.email)
          .single();

        if (error || !data) { setNotFound(true); return; }

        const entry: SavedProject = {
          id:          data.id,
          createdAt:   data.created_at,
          project:     data.project_data as StoredProject,
          assessment:  data.assessment_data as AssessmentResult,
        };

        // Cache in localStorage so subsequent visits are instant (preserve the Supabase UUID)
        projectStore.save(entry.project, entry.assessment, entry.id);
        setSaved(entry);
        const docs = getDocuments(entry.project.constraints);
        const cached = loadCachedDocs();
        const restoredStatuses: Record<string, DocStatus> = {};
        const restoredContents: Record<string, string> = {};
        docs.forEach((doc) => {
          if (cached[doc.name]) {
            restoredContents[doc.name] = cached[doc.name];
            restoredStatuses[doc.name] = "done";
          }
        });
        if (Object.keys(restoredContents).length > 0) {
          setDocContents(restoredContents);
          setDocStatuses(restoredStatuses);
        }
        const missing = docs.filter((doc) => !cached[doc.name]);
        missing.forEach((doc, i) => { setTimeout(() => generateDoc(doc.name, entry.project), i * 1200); });
      } catch {
        setNotFound(true);
      }
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgb(234,245,245)", gap: 16, padding: 24 }}>
        <AlertTriangle size={40} color="rgb(180,180,180)" />
        <p style={{ fontSize: 17, color: "rgb(60,80,90)", textAlign: "center", maxWidth: 400 }}>This project wasn&apos;t found. It may have been cleared from your browser.</p>
        <Link href="/dashboard/projects/new" style={{ padding: "12px 24px", borderRadius: 12, background: "rgb(11,29,40)", color: "white", textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
          Start a new check
        </Link>
      </div>
    );
  }

  if (!saved) return null;

  const { project, assessment } = saved;
  const sc           = scoreColor(assessment.score);
  const constraints  = buildConstraints(project.constraints);
  const costs        = buildCosts(project.projectTypeId, project.constraints);
  const docs         = getDocuments(project.constraints);
  const SEV          = { high: 0, medium: 1, low: 2 } as Record<string, number>;
  const sortedRisks  = [...assessment.risks].sort((a, b) => SEV[a.severity] - SEV[b.severity]);
  const hasSerious   = sortedRisks.some((r) => r.severity === "high" || r.severity === "medium");

  // Derive verdict from score so it's always consistent with the gauge
  const scoreVerdict = assessment.score >= 70
    ? "Likely Approved"
    : assessment.score >= 45
      ? "Borderline — needs careful preparation"
      : "High Risk — significant obstacles to overcome";

  return (
    <div style={{ fontFamily: '"Rethink Sans","Helvetica Neue",Arial,sans-serif', background: "rgb(234,245,245)", minHeight: "100vh" }}>

      <main>
        <div style={{ background: "rgb(234,245,245)", paddingBottom: 64 }}>

          {/* ══ HERO ══════════════════════════════════════════════════════════ */}
          <section style={{ position: "relative", overflow: "hidden", paddingTop: 68, minHeight: 360 }}>
            <HeroBg />
            <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "36px 64px 72px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <Link href="/dashboard/projects" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 15, fontWeight: 500 }}>
                  <ChevronLeft size={16} strokeWidth={2} /> Back to projects
                </Link>

                {/* Delete project */}
                {confirmDelete ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(200,60,60,0.15)", border: "1px solid rgba(200,60,60,0.35)", borderRadius: 12, padding: "8px 16px" }}>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>Delete this project?</span>
                    <button
                      onClick={() => {
                        projectStore.deleteById(id!);
                        sessionStorage.removeItem("pp_latest_project_id");
                        router.replace("/dashboard/projects");
                      }}
                      style={{ fontSize: 13, fontWeight: 700, color: "rgb(255,100,100)", background: "rgba(200,60,60,0.25)", border: "1px solid rgba(200,60,60,0.5)", borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", cursor: "pointer", padding: "5px 8px" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.35)", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "7px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}
                  >
                    <Trash2 size={13} strokeWidth={2} /> Delete project
                  </button>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.10)", borderRadius: 20, padding: "5px 14px", marginBottom: 16 }}>
                    <MapPin size={13} color="rgba(255,255,255,0.6)" strokeWidth={2} />
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{project.council || "Local Planning Authority"}</span>
                  </div>
                  <h1 style={{ fontSize: 46, fontWeight: 700, color: "white", margin: "0 0 12px 0", letterSpacing: -1 }}>{project.address}</h1>
                  <p style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", margin: "0 0 24px 0", maxWidth: 520, lineHeight: 1.6 }}>{project.description || project.projectTypeLabel}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, padding: "9px 16px" }}>
                    <Building2 size={15} color="rgba(255,255,255,0.5)" strokeWidth={1.8} />
                    <span style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>{project.projectTypeLabel}</span>
                  </div>
                </div>
                <ScoreDonut score={assessment.score} />
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, zIndex: 2, lineHeight: 0, pointerEvents: "none" }}>
              <svg viewBox="0 0 1440 80" preserveAspectRatio="none" width="100%" height="80">
                <path d="M0,0 Q360,80 720,40 Q1080,0 1440,60 L1440,80 L0,80 Z" fill="rgb(234,245,245)" />
              </svg>
            </div>
          </section>

          {/* ══ CONTENT ═══════════════════════════════════════════════════════ */}
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 64px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, marginTop: 32 }}>

              {/* LEFT */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Site constraints */}
                <div style={CARD}>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>Site constraints</h2>
                  <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 12px 0" }}>{constraints.length} checks run against national and local planning data</p>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(100,120,130,0.07)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                    <AlertTriangle size={14} color="rgb(130,150,160)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 13, color: "rgb(100,120,130)", margin: 0, lineHeight: 1.5 }}>
                      Data sourced from the national planning dataset. Coverage varies by council — always verify constraints directly with your local planning authority before submitting.
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {constraints.map((c, i) => {
                      const isFlood    = c.label === "Flood zone" && c.status !== "pass";
                      const isExpanded = expandedConstraint === c.label;
                      return (
                        <div key={i} style={{ borderBottom: i < constraints.length - 1 ? "1px solid rgb(240,246,246)" : "none" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 0" }}>
                            <div style={{ marginTop: 2 }}>{constraintIcon(c.label)}</div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 16, fontWeight: 600, color: "rgb(11,29,40)", margin: "0 0 3px 0" }}>{c.label}</p>
                              <p style={{ fontSize: 14, color: "rgb(100,120,130)", margin: 0 }}>{c.note}</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginTop: 2 }}>
                              {isFlood && (
                                <button
                                  onClick={() => setExpandedConstraint(isExpanded ? null : c.label)}
                                  style={{ fontSize: 12, fontWeight: 600, color: "rgb(55,176,170)", background: "rgba(55,176,170,0.10)", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}
                                >
                                  {isExpanded ? "Hide" : "What to do"}
                                </button>
                              )}
                              <StatusIcon status={c.status} />
                            </div>
                          </div>
                          {isFlood && isExpanded && (
                            <div style={{ background: "rgba(212,150,42,0.06)", border: "1px solid rgba(212,150,42,0.2)", borderRadius: 14, padding: "16px 20px", marginBottom: 16 }}>
                              <p style={{ fontSize: 14, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 8px 0" }}>What you need to commission</p>
                              <p style={{ fontSize: 14, color: "rgb(60,80,90)", margin: "0 0 12px 0", lineHeight: 1.6 }}>
                                A <strong>Flood Risk Assessment (FRA)</strong> is required for extensions likely over 40m² in a flood zone. This is a technical report prepared by a specialist hydrological consultant — not a standard architect.
                              </p>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                                {[
                                  { label: "Flood Risk Assessment", value: "£800 – £1,500", note: "From an approved flood risk consultant" },
                                  { label: "Sustainable drainage strategy", value: "£400 – £800",   note: "Often required alongside the FRA" },
                                ].map((item, j) => (
                                  <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", borderRadius: 10, padding: "10px 14px" }}>
                                    <div>
                                      <p style={{ fontSize: 13, fontWeight: 600, color: "rgb(11,29,40)", margin: 0 }}>{item.label}</p>
                                      <p style={{ fontSize: 12, color: "rgb(130,150,160)", margin: 0 }}>{item.note}</p>
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgb(11,29,40)", whiteSpace: "nowrap", marginLeft: 12 }}>{item.value}</span>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => { const el = document.getElementById("lead-capture"); el?.scrollIntoView({ behavior: "smooth" }); }}
                                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#D4922A", color: "white", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                              >
                                Connect me with a flood risk specialist →
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 20, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgb(240,246,246)" }}>
                    {(["pass","warn","fail"] as const).map((s) => (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <StatusIcon status={s} />
                        <span style={{ fontSize: 13, color: "rgb(100,120,130)" }}>{s === "pass" ? "No issue" : s === "warn" ? "Needs attention" : "Significant constraint"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks / Points to address */}
                {sortedRisks.length > 0 && (
                  <div style={CARD}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 6px 0" }}>
                      {hasSerious ? "Risk factors" : "Points to address"}
                    </h2>
                    <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: "0 0 20px 0" }}>
                      {hasSerious ? "Issues identified that could affect your application" : "Minor points worth noting before you submit"}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {sortedRisks.map((r, i) => {
                        const sevColor = r.severity === "high" ? "rgb(200,60,60)" : r.severity === "medium" ? "rgb(212,150,42)" : "rgb(100,120,130)";
                        const sevBg    = r.severity === "high" ? "rgba(200,60,60,0.08)" : r.severity === "medium" ? "rgba(212,150,42,0.08)" : "rgba(100,120,130,0.06)";
                        const sevLabel = r.severity === "high" ? "High risk" : r.severity === "medium" ? "Medium risk" : "Low";
                        return (
                          <div key={i} style={{ background: sevBg, borderRadius: 16, padding: "18px 20px", borderLeft: `3px solid ${sevColor}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <p style={{ fontSize: 16, fontWeight: 700, color: "rgb(11,29,40)", margin: 0 }}>{r.title}</p>
                              <span style={{ fontSize: 12, fontWeight: 600, color: sevColor, background: `${sevColor}1a`, borderRadius: 8, padding: "2px 9px" }}>{sevLabel}</span>
                            </div>
                            <p style={{ fontSize: 15, color: "rgb(60,80,90)", margin: 0, lineHeight: 1.6 }}>{r.detail}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Verdict */}
                <div style={{ ...CARD, background: "rgb(11,29,40)" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Overall verdict</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: sc, margin: "0 0 12px 0", lineHeight: 1.2 }}>{scoreVerdict}</p>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", margin: "0 0 20px 0", lineHeight: 1.6 }}>
                    {assessment.score >= 65
                      ? "Your project aligns well with local planning policy. Address the minor issues and your application is well-positioned."
                      : assessment.score >= 45
                      ? "Your project has merit but faces real risks. Carefully address each issue before submitting."
                      : "Significant policy conflicts detected. A pre-application meeting with the council is strongly recommended."}
                  </p>
                  <button onClick={() => { const el = document.getElementById("lead-capture"); el?.scrollIntoView({ behavior: "smooth" }); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: sc, color: "white", borderRadius: 12, padding: "13px 18px", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, width: "100%" }}>
                    Get professional advice <ArrowRight size={16} strokeWidth={2} />
                  </button>
                </div>

                {/* Documents */}
                <div id="documents" style={CARD}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 4px 0" }}>Your documents</h3>
                  <p style={{ fontSize: 14, color: "rgb(100,120,130)", margin: "0 0 16px 0" }}>Auto-generated from your assessment</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {docs.map((doc, i) => {
                      const status = docStatuses[doc.name] ?? "generating";
                      const isDone = status === "done";
                      const isGenerating = status === "generating";
                      const isError = status === "error";
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgb(234,245,245)", borderRadius: 12, padding: "13px 16px" }}>
                          <FileSignature size={20} color={isDone ? "rgb(55,176,170)" : "rgb(180,200,200)"} strokeWidth={1.8} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "rgb(11,29,40)", margin: "0 0 2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</p>
                            <p style={{ fontSize: 12, color: "rgb(130,150,160)", margin: 0 }}>
                              {isDone ? "Ready · Click to view" : isGenerating ? <PulsingDot /> : isError ? <span style={{ color: "rgb(200,60,60)" }}>Failed — tap retry</span> : <PulsingDot />}
                            </p>
                          </div>
                          {isDone && (
                            <button onClick={() => setViewingDoc({ name: doc.name, html: docContents[doc.name] })} style={{ padding: "5px 12px", borderRadius: 8, background: "rgb(55,176,170)", border: "none", cursor: "pointer", color: "white", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>View</button>
                          )}
                          {isGenerating && <Loader2 size={16} color="rgb(180,200,200)" strokeWidth={2} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />}
                          {isError && (
                            <button onClick={() => {
                              // Clear cached entry so it regenerates fresh
                              if (docCacheKey) {
                                try {
                                  const c = JSON.parse(localStorage.getItem(docCacheKey) ?? "{}");
                                  delete c[doc.name];
                                  localStorage.setItem(docCacheKey, JSON.stringify(c));
                                } catch { /* ignore */ }
                              }
                              generateDoc(doc.name, project);
                            }} style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(200,60,60,0.1)", border: "none", cursor: "pointer", color: "rgb(200,60,60)", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>Retry</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next steps */}
                <div style={CARD}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 16px 0" }}>Recommended next steps</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      "Review each risk flag and constraint above",
                      "Download your planning documents",
                      assessment.score < 55 ? "Book a pre-application meeting with the council" : "Submit your application via the Planning Portal",
                    ].map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgb(226,240,240)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "rgb(55,176,170)" }}>{i + 1}</span>
                        </div>
                        <p style={{ fontSize: 15, color: "rgb(45,56,67)", margin: 0 }}>{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost estimate */}
                <div style={{ ...CARD, padding: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 4px 0" }}>Cost estimate</h3>
                  <p style={{ fontSize: 14, color: "rgb(100,120,130)", margin: "0 0 12px 0" }}>Typical costs to planning permission</p>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {costs.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "10px 0", borderBottom: i < costs.length - 1 ? "1px solid rgb(240,246,246)" : "none" }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: item.highlight ? 15 : 14, fontWeight: item.highlight ? 700 : 500, color: item.highlight ? "rgb(11,29,40)" : "rgb(60,80,90)", margin: 0 }}>{item.label}</p>
                          {item.note && !item.highlight && <p style={{ fontSize: 12, color: "rgb(160,180,185)", margin: "2px 0 0 0" }}>{item.note}</p>}
                        </div>
                        <span style={{
                          fontSize: item.highlight ? 15 : 14,
                          fontWeight: item.highlight ? 700 : 600,
                          color: item.included ? "rgb(55,176,170)" : item.highlight ? "rgb(11,29,40)" : "rgb(11,29,40)",
                          background: item.included ? "rgba(55,176,170,0.10)" : "transparent",
                          borderRadius: item.included ? 8 : 0,
                          padding: item.included ? "3px 10px" : 0,
                          whiteSpace: "nowrap", flexShrink: 0,
                        }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: "rgb(180,195,195)", margin: "12px 0 0 0" }}>Architectural drawing and build cost estimates only — get exact quotes from local professionals.</p>
                </div>

              </div>
            </div>
          </div>

          {/* ══ ASSESSMENT SUMMARY (full width) ════════════════════════════════ */}
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 64px", marginTop: 20 }}>
            <div style={{ ...CARD, marginTop: 0 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 20px 0" }}>Assessment summary</h2>

              {/* Borough rate vs project score */}
              {assessment.area_approval_rate != null && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                  <div style={{ background: "rgba(55,176,170,0.07)", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(55,176,170,0.18)" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "rgb(100,120,130)", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.07em" }}>Borough approval rate</p>
                    <p style={{ fontSize: 32, fontWeight: 700, color: "rgb(55,176,170)", margin: "0 0 4px 0", letterSpacing: -1 }}>{assessment.area_approval_rate}%</p>
                    <p style={{ fontSize: 13, color: "rgb(130,150,160)", margin: 0 }}>of all householder applications in {project.council}</p>
                  </div>
                  <div style={{ background: `${scoreColor(assessment.score)}0f`, borderRadius: 14, padding: "18px 20px", border: `1px solid ${scoreColor(assessment.score)}30` }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "rgb(100,120,130)", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.07em" }}>Your project score</p>
                    <p style={{ fontSize: 32, fontWeight: 700, color: sc, margin: "0 0 4px 0", letterSpacing: -1 }}>{assessment.score}<span style={{ fontSize: 15, fontWeight: 400, color: "rgb(130,150,160)" }}>/100</span></p>
                    <p style={{ fontSize: 13, color: "rgb(130,150,160)", margin: 0 }}>based on site constraints and design factors</p>
                  </div>
                </div>
              )}

              {/* Bridge note when score < borough rate */}
              {assessment.area_approval_rate != null && assessment.score < assessment.area_approval_rate && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(212,150,42,0.07)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
                  <AlertTriangle size={15} color="rgb(180,120,30)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 14, color: "rgb(100,70,10)", margin: 0, lineHeight: 1.6 }}>
                    Your project scores below the borough average because of site-specific factors — see the risk flags above. Addressing these before submitting will improve your chances.
                  </p>
                </div>
              )}

              <p style={{ fontSize: 16, color: "rgb(60,80,90)", margin: "0 0 14px 0", lineHeight: 1.75, maxWidth: 860 }}>{assessment.summary}</p>

              <p style={{ fontSize: 13, color: "rgb(160,180,185)", margin: 0 }}>
                {assessment.area_approval_rate_label ?? `Borough rate based on householder decisions in ${project.council}, 2023–24 · MHCLG PS2`}
              </p>
              {assessment.area_approval_rate_caveat && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(212,150,42,0.08)", borderRadius: 10, padding: "10px 14px", marginTop: 10 }}>
                  <AlertTriangle size={13} color="rgb(180,120,30)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 13, color: "rgb(140,100,30)", margin: 0, lineHeight: 1.5 }}>{assessment.area_approval_rate_caveat}</p>
                </div>
              )}
            </div>
          </div>

          {/* ══ LEAD CAPTURE ═══════════════════════════════════════════════════ */}
          <div id="lead-capture" style={{ maxWidth: 1280, margin: "32px auto 0", padding: "0 64px" }}>
            <LeadCapture address={project.address} />
          </div>

        </div>
      </main>

      {viewingDoc && <DocViewerModal name={viewingDoc.name} html={viewingDoc.html} onClose={() => setViewingDoc(null)} />}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .doc-viewer-body h2 { font-size: 18px; font-weight: 700; color: rgb(11,29,40); margin: 24px 0 10px; }
        .doc-viewer-body h3 { font-size: 16px; font-weight: 600; color: rgb(11,29,40); margin: 20px 0 8px; }
        .doc-viewer-body p  { margin: 0 0 12px; }
        .doc-viewer-body ul { padding-left: 20px; margin: 0 0 12px; }
        .doc-viewer-body li { margin-bottom: 6px; }
      `}</style>
    </div>
  );
}
