"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, FileSignature, Download, Eye, CheckCircle,
  Loader2, AlertTriangle, ChevronRight, ChevronLeft,
  Building2, Plus, FolderOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import type { SavedProject } from "@/lib/project-store";

function HeroBg() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: "inherit", overflow: "hidden" }}>
      <svg preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block", width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="docSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0e1e30" />
            <stop offset="40%"  stopColor="#1a3448" />
            <stop offset="70%"  stopColor="#2a5850" />
            <stop offset="100%" stopColor="#3a6040" />
          </linearGradient>
          <radialGradient id="docSun" cx="75%" cy="25%" r="35%">
            <stop offset="0%"  stopColor="#d4922a" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#d4922a" stopOpacity="0"   />
          </radialGradient>
        </defs>
        <rect fill="url(#docSky)" width="100%" height="100%" />
        <rect fill="url(#docSun)" width="100%" height="100%" />
      </svg>
    </div>
  );
}

const DOC_NAMES = ["Design & Access Statement", "Planning Statement", "Cover Letter", "Heritage Statement"];

type DocEntry = {
  projectId:      string;
  projectAddress: string;
  council:        string;
  projectType:    string;
  createdAt:      string;
  docName:        string;
  html:           string;
};

// ── Viewer modal ──────────────────────────────────────────────────────────────
function DocModal({ entry, onClose }: { entry: DocEntry; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(11,29,40,0.72)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 780, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Inter', sans-serif" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid rgb(234,245,245)" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgb(130,150,160)", margin: "0 0 3px 0", textTransform: "uppercase", letterSpacing: "0.07em" }}>{entry.projectAddress}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{entry.docName}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={async () => {
                const { pdfMake } = await import("@/lib/pdfmake-setup");
                const htmlToPdfmake = (await import("html-to-pdfmake")).default;
                const content = htmlToPdfmake(entry.html, { window });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (pdfMake as any).createPdf({ content: content as any, defaultStyle: { font: "Roboto", fontSize: 11, lineHeight: 1.5 }, pageMargins: [60, 60, 60, 60] }).download(`${entry.docName}.pdf`);
              }}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "rgb(11,29,40)", color: "white", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <Download size={14} strokeWidth={2} /> Download PDF
            </button>
            <button onClick={onClose} style={{ background: "rgb(234,245,245)", color: "rgb(60,80,90)", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
        <div
          className="doc-viewer-body"
          style={{ overflowY: "auto", padding: "32px 40px", fontSize: 14, lineHeight: 1.8, color: "rgb(40,60,70)" }}
          dangerouslySetInnerHTML={{ __html: entry.html }}
        />
      </div>
      <style>{`
        .doc-viewer-body h1 { font-size: 20px; font-weight: 700; color: rgb(11,29,40); margin: 0 0 16px 0; }
        .doc-viewer-body h2 { font-size: 17px; font-weight: 700; color: rgb(11,29,40); margin: 24px 0 8px; }
        .doc-viewer-body h3 { font-size: 15px; font-weight: 600; color: rgb(11,29,40); margin: 20px 0 6px; }
        .doc-viewer-body p  { margin: 0 0 12px; }
        .doc-viewer-body ul { padding-left: 20px; margin: 0 0 12px; }
        .doc-viewer-body li { margin-bottom: 5px; }
      `}</style>
    </div>
  );
}

// ── Single doc row ────────────────────────────────────────────────────────────
function DocRow({ entry, onView }: { entry: DocEntry; onView: (e: DocEntry) => void }) {
  const { isMobile } = useBreakpoint();
  return (
    <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: 12, padding: "14px 0", borderBottom: "1px solid rgb(240,247,247)", flexWrap: isMobile ? "wrap" : "nowrap" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(55,176,170,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <FileSignature size={16} color="rgb(55,176,170)" strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "rgb(11,29,40)", margin: "0 0 2px 0" }}>{entry.docName}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <CheckCircle size={11} color="rgb(55,176,170)" strokeWidth={2.5} />
          <span style={{ fontSize: 12, color: "rgb(55,176,170)", fontWeight: 600 }}>Ready</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0, width: isMobile ? "100%" : "auto", paddingLeft: isMobile ? 48 : 0 }}>
        <button
          onClick={() => onView(entry)}
          style={{ flex: isMobile ? 1 : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "rgb(234,245,245)", color: "rgb(11,29,40)", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          <Eye size={13} strokeWidth={2} /> View
        </button>
        <button
          onClick={async () => {
            const { pdfMake } = await import("@/lib/pdfmake-setup");
            const htmlToPdfmake = (await import("html-to-pdfmake")).default;
            const content = htmlToPdfmake(entry.html, { window });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (pdfMake as any).createPdf({ content: content as any, defaultStyle: { font: "Roboto", fontSize: 11, lineHeight: 1.5 }, pageMargins: [60, 60, 60, 60] }).download(`${entry.docName}.pdf`);
          }}
          style={{ flex: isMobile ? 1 : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "rgb(11,29,40)", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          <Download size={13} strokeWidth={2} /> PDF
        </button>
      </div>
    </div>
  );
}

// ── Project group card ────────────────────────────────────────────────────────
function ProjectGroup({ project, docs, onView }: { project: SavedProject; docs: DocEntry[]; onView: (e: DocEntry) => void }) {
  const [open, setOpen] = useState(true);
  const { isMobile } = useBreakpoint();
  const date = new Date(project.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return (
    <div style={{ background: "white", borderRadius: 20, boxShadow: "rgba(0,0,0,0.06) 0px 1px 8px 0px", overflow: "hidden" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: isMobile ? "16px 18px" : "20px 24px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgb(11,29,40)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Building2 size={16} color="white" strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{project.project.address}</p>
          <p style={{ fontSize: 12, color: "rgb(100,120,130)", margin: 0 }}>
            {project.project.council}{!isMobile && <> · {project.project.projectTypeLabel}</>} · {date}
          </p>
        </div>
        {!isMobile && (
          <Link
            href={`/dashboard/projects/${project.id}`}
            onClick={(e) => e.stopPropagation()}
            style={{ fontSize: 13, fontWeight: 600, color: "rgb(55,176,170)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, flexShrink: 0, whiteSpace: "nowrap" }}
          >
            View report <ChevronRight size={13} strokeWidth={2} />
          </Link>
        )}
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgb(248,250,250)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ChevronRight
            size={14}
            color="rgb(130,150,160)"
            strokeWidth={2}
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          />
        </div>
      </button>
      {open && (
        <div style={{ padding: isMobile ? "0 18px 8px" : "0 24px 8px", borderTop: "1px solid rgb(240,247,247)" }}>
          {docs.map((entry, i) => (
            <DocRow key={i} entry={entry} onView={onView} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [allDocs, setAllDocs]   = useState<DocEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [viewing, setViewing]   = useState<DocEntry | null>(null);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const { isMobile }            = useBreakpoint();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      let allProjects: SavedProject[] = [];
      if (session?.user) {
        const { data } = await supabase
          .from("projects")
          .select("id, project_data, assessment_data, created_at")
          .order("created_at", { ascending: false });
        if (data) {
          allProjects = data.map((r) => ({
            id: r.id,
            createdAt: r.created_at,
            project: r.project_data as SavedProject["project"],
            assessment: r.assessment_data as SavedProject["assessment"],
          }));
        }
      }

      setProjects(allProjects);

      // Docs are cached in localStorage keyed by the project's UUID
      const entries: DocEntry[] = [];
      for (const p of allProjects) {
        let cached: Record<string, string> = {};
        try { cached = JSON.parse(localStorage.getItem(`pp_docs_${p.id}`) ?? "{}"); } catch { /* empty */ }
        for (const docName of DOC_NAMES) {
          if (cached[docName]) {
            entries.push({
              projectId: p.id, projectAddress: p.project.address,
              council: p.project.council ?? "", projectType: p.project.projectTypeLabel ?? "",
              createdAt: p.createdAt, docName, html: cached[docName],
            });
          }
        }
      }
      setAllDocs(entries);
      setLoading(false);
    }
    load();
  }, []);

  const byProject = projects
    .map((p) => ({ project: p, docs: allDocs.filter((d) => d.projectId === p.id) }))
    .filter((g) => g.docs.length > 0);

  const totalDocs  = allDocs.length;
  const totalProjs = byProject.length;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "rgb(248,250,250)", minHeight: "100vh" }}>
      <main>
        {/* ── PAGE WRAPPER ──────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "12px 16px 40px" : "24px 48px 48px" }}>

          {/* HERO CARD */}
          <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", padding: isMobile ? "32px 24px 36px" : "48px 52px 52px", marginBottom: isMobile ? 12 : 16 }}>
            <HeroBg />
            <div style={{ position: "relative", zIndex: 1 }}>
              <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
                <ChevronLeft size={14} strokeWidth={2} /> Dashboard
              </Link>
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: isMobile ? 20 : 16 }}>
                <div>
                  <h1 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, color: "white", letterSpacing: -0.5, margin: "0 0 8px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your documents</h1>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                    {loading ? "Loading…" : totalDocs > 0
                      ? <>{totalDocs} document{totalDocs !== 1 ? "s" : ""} across {totalProjs} project{totalProjs !== 1 ? "s" : ""}</>
                      : "Documents are generated when you open a project report"}
                  </p>
                </div>
                <Link href="/dashboard/projects/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#D4922A", color: "white", borderRadius: 100, padding: "12px 22px", fontSize: 14, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif", boxShadow: "0 0 24px rgba(212,146,42,0.35)", flexShrink: 0, alignSelf: isMobile ? "flex-start" : "auto" }}>
                  <Plus size={15} strokeWidth={2.5} /> New check
                </Link>
              </div>
            </div>
          </div>

          {/* ── CONTENT ──────────────────────────────────────────────────── */}
          <div>
            {loading ? (
              <div style={{ background: "white", borderRadius: 20, padding: "56px 40px", textAlign: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <Loader2 size={20} color="rgb(130,150,160)" strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ fontSize: 15, color: "rgb(130,150,160)", margin: 0 }}>Loading documents…</p>
              </div>
            ) : totalDocs === 0 ? (
              <div style={{ background: "white", borderRadius: 20, padding: "56px 40px", textAlign: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgb(248,250,250)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <FileText size={24} color="rgb(180,200,200)" strokeWidth={1.6} />
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 8px 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No documents yet</p>
                <p style={{ fontSize: 15, color: "rgb(130,150,160)", margin: "0 0 28px 0", lineHeight: 1.6 }}>
                  Open a project report and generate your Design &amp; Access Statement, Planning Statement and more.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <Link href="/dashboard/projects" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgb(11,29,40)", color: "white", borderRadius: 100, padding: "12px 22px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                    <FolderOpen size={14} strokeWidth={2} /> View projects
                  </Link>
                  <Link href="/dashboard/projects/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#D4922A", color: "white", borderRadius: 100, padding: "12px 22px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                    <Plus size={14} strokeWidth={2.5} /> New assessment
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
                  {[
                    { label: "Documents ready",   value: totalDocs,                                   color: "rgb(55,176,170)"  },
                    { label: "Projects covered",  value: totalProjs,                                  color: "rgb(11,29,40)"    },
                    { label: "Councils covered",  value: new Set(allDocs.map((d) => d.council)).size, color: "rgb(212,150,42)"  },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "white", borderRadius: 20, padding: "20px 24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "rgb(130,150,160)", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
                      <p style={{ fontSize: 36, fontWeight: 800, color, margin: 0, letterSpacing: -1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Project groups */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {byProject.map(({ project, docs }) => (
                    <ProjectGroup key={project.id} project={project} docs={docs} onView={setViewing} />
                  ))}
                </div>

                {/* Cache note */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 16, padding: "14px 18px", background: "rgba(212,150,42,0.08)", border: "1.5px solid rgba(212,150,42,0.25)", borderRadius: 14 }}>
                  <AlertTriangle size={15} color="rgb(212,150,42)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 13, color: "rgb(120,80,10)", margin: 0, fontWeight: 500 }}>
                    Documents are stored in your browser. Download PDFs to keep a permanent copy.
                  </p>
                </div>
              </>
            )}
          </div>

        </div>
      </main>

      {viewing && <DocModal entry={viewing} onClose={() => setViewing(null)} />}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
