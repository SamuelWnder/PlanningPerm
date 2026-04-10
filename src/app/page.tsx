"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BRAND = "PlanningPerm";

// ── ICONS ──────────────────────────────────────────────────────────────────────

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4 inline-block" fill="#f59e0b">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function Stars({ n = 5 }: { n?: number }) {
  return <span className="flex gap-0.5">{Array.from({ length: n }).map((_, i) => <Star key={i} />)}</span>;
}

function Check() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-sm" style={{ background: "rgba(55,176,170,0.12)", color: "rgb(55,176,170)" }}>✓</span>
  );
}

function Dash() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 text-gray-400 text-sm font-bold">–</span>
  );
}

// ── SKETCH ILLUSTRATIONS ───────────────────────────────────────────────────────

function SketchScore() {
  return (
    <svg viewBox="0 0 72 72" className="w-16 h-16 mx-auto mb-6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="36" cy="36" r="26" stroke="#D4922A" strokeWidth="2.5" />
      <circle cx="36" cy="36" r="18" stroke="#D4922A" strokeWidth="2" strokeDasharray="4 3" />
      <path d="M36 18 L36 28" stroke="#D4922A" strokeWidth="2.5" />
      <path d="M36 36 L44 28" stroke="#D4922A" strokeWidth="2.5" />
      <circle cx="36" cy="36" r="3" stroke="#D4922A" strokeWidth="2" fill="#D4922A" />
      <path d="M20 52 L26 46" stroke="#D4922A" strokeWidth="2" />
      <path d="M52 52 L46 46" stroke="#D4922A" strokeWidth="2" />
    </svg>
  );
}

function SketchMap() {
  return (
    <svg viewBox="0 0 72 72" className="w-16 h-16 mx-auto mb-6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M36 10 C36 10 20 22 20 36 C20 44 27 50 36 50 C45 50 52 44 52 36 C52 22 36 10 36 10Z" stroke="rgb(55,176,170)" strokeWidth="2.5" />
      <circle cx="36" cy="36" r="7" stroke="rgb(55,176,170)" strokeWidth="2" />
      <path d="M36 50 L36 62" stroke="rgb(55,176,170)" strokeWidth="2.5" />
      <line x1="28" y1="62" x2="44" y2="62" stroke="rgb(55,176,170)" strokeWidth="2" />
    </svg>
  );
}

function SketchDoc() {
  return (
    <svg viewBox="0 0 72 72" className="w-16 h-16 mx-auto mb-6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="16" y="8" width="32" height="44" rx="4" stroke="#D4922A" strokeWidth="2.5" />
      <path d="M24 22 L48 22" stroke="#D4922A" strokeWidth="2" />
      <path d="M24 30 L48 30" stroke="#D4922A" strokeWidth="2" />
      <path d="M24 38 L38 38" stroke="#D4922A" strokeWidth="2" />
      <path d="M40 48 L56 64" stroke="#D4922A" strokeWidth="2.5" />
      <circle cx="40" cy="48" r="8" stroke="#D4922A" strokeWidth="2" />
      <path d="M37 48 L43 48M40 45 L40 51" stroke="#D4922A" strokeWidth="1.5" />
    </svg>
  );
}

function SketchPersonDoc() {
  return (
    <svg viewBox="0 0 80 80" className="w-20 h-20 mx-auto mb-8" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="28" cy="18" r="8" stroke="white" strokeWidth="2" />
      <path d="M14 42 C14 32 42 32 42 42 L42 54 L14 54 Z" stroke="white" strokeWidth="2" />
      <rect x="48" y="16" width="24" height="32" rx="3" stroke="white" strokeWidth="1.5" />
      <line x1="53" y1="24" x2="67" y2="24" stroke="white" strokeWidth="1.5" />
      <line x1="53" y1="30" x2="67" y2="30" stroke="white" strokeWidth="1.5" />
      <line x1="53" y1="36" x2="61" y2="36" stroke="white" strokeWidth="1.5" />
      <path d="M56 48 L56 60" stroke="white" strokeWidth="1.5" strokeDasharray="2 2" />
      <path d="M42 42 L48 38" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

function SketchCheckHouse() {
  return (
    <svg viewBox="0 0 56 56" className="w-14 h-14 mb-8" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 26 L28 6 L50 26" stroke="white" strokeWidth="2" />
      <rect x="12" y="26" width="32" height="22" stroke="white" strokeWidth="2" />
      <path d="M20 38 L25 43 L36 32" stroke="white" strokeWidth="2.5" />
    </svg>
  );
}

// ── TESTIMONIAL BANNER ─────────────────────────────────────────────────────────

function TestimonialBanner({ name, location, quote }: { name: string; location: string; quote: string }) {
  return (
    <section className="bg-[#eaf5f5] py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="text-center sm:text-left w-full md:w-auto">
          <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#0b1d28] mb-1">{name} · {location}</p>
          <div className="flex justify-center sm:justify-start"><Stars /></div>
          <p className="text-lg sm:text-xl italic font-medium text-[#0b1d28] mt-3 max-w-xl">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
        <div className="shrink-0 w-full sm:w-auto text-center sm:text-left">
          <Link href="/dashboard/projects/new" className="inline-block border-2 border-[#0b1d28] text-[#0b1d28] rounded-full px-8 py-3 text-sm font-semibold hover:bg-[#0b1d28] hover:text-white transition-colors whitespace-nowrap">
            Check my property
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── PAGE ───────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [postcode, setPostcode] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const videos = ["/hero.mp4", "/hero2.mp4", "/hero3.mp4"];
  const [videoIdx, setVideoIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  function advanceVideo(next: number) {
    if (next === videoIdx) return;
    setPrevIdx(videoIdx);
    setVideoIdx(next);
    setTimeout(() => setPrevIdx(null), 900);
  }

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const dest = postcode.trim()
      ? `/dashboard/projects/new?postcode=${encodeURIComponent(postcode.trim())}`
      : "/dashboard/projects/new";
    router.push(dest);
  }

  const tableRows: { feature: string; pp: boolean; consultant: boolean; diy: boolean }[] = [
    { feature: "Real approval probability score",                                    pp: true,  consultant: true,  diy: false },
    { feature: "20 automated site constraint checks",                              pp: true,  consultant: true,  diy: false },
    { feature: "Council decision history cross-reference",                           pp: true,  consultant: false, diy: false },
    { feature: "AI-drafted Design & Access Statement",                               pp: true,  consultant: true,  diy: false },
    { feature: "Planning Statement & Cover Letter included",                         pp: true,  consultant: true,  diy: false },
    { feature: "Results in under 2 minutes",                                         pp: true,  consultant: false, diy: false },
    { feature: "Free preview — no card required",                                    pp: true,  consultant: false, diy: false },
    { feature: "Full report under £25",                                              pp: true,  consultant: false, diy: false },
  ];

  // Councils covered — sample shown in the data section
  const sampleCouncils = [
    "London Borough of Hackney",
    "Royal Borough of Kensington & Chelsea",
    "Leeds City Council",
    "Manchester City Council",
    "Bristol City Council",
    "Birmingham City Council",
    "Sheffield City Council",
    "London Borough of Islington",
    "Brighton & Hove City Council",
    "Oxford City Council",
    "Cambridge City Council",
    "Liverpool City Council",
  ];
  const [councilSearch, setCouncilSearch] = useState("");
  const councilMatch = councilSearch.trim().length > 1
    ? sampleCouncils.find(c => c.toLowerCase().includes(councilSearch.toLowerCase()))
    : null;

  return (
    <div className="font-sans text-[#0b1d28]" style={{ fontFamily: "'Euclid Circular B', sans-serif" }}>

      {/* ── 1. NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Hamburger — mobile only */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] w-9 h-9 p-1.5"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Menu"
        >
          <span className={`block h-[2px] bg-[#0b1d28] rounded-full transition-all ${navOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block h-[2px] bg-[#0b1d28] rounded-full transition-all ${navOpen ? "opacity-0" : ""}`} />
          <span className={`block h-[2px] bg-[#0b1d28] rounded-full transition-all ${navOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>

        <div className="flex items-center gap-2">
          <LogoIcon className="w-6 h-6 text-[#D4922A]" />
          <span className="text-[#0b1d28] text-lg font-normal lowercase tracking-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>{BRAND}</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.14em] font-semibold text-[#0b1d28]">
          {[["How it works","#how-it-works"],["Pricing","#pricing"],["Blog","/blog"]].map(([label, href]) => (
            <a key={label} href={href} className="hover:text-[#D4922A] transition-colors whitespace-nowrap">{label}</a>
          ))}
        </div>

        <Link href="/dashboard/projects/new" className="bg-[#D4922A] text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#b87820] transition-colors whitespace-nowrap">
          Check my property
        </Link>
      </nav>

      {/* Mobile nav drawer */}
      {navOpen && (
        <div className="md:hidden sticky top-[57px] z-40 bg-white border-t border-gray-100 px-5 py-4 flex flex-col gap-1">
          {[["How it works","#how-it-works"],["Pricing","#pricing"],["Blog","/blog"]].map(([label, href]) => (
            <a key={label} href={href} onClick={() => setNavOpen(false)}
               className="py-3 text-sm font-semibold text-[#0b1d28] border-b border-gray-50 hover:text-[#D4922A] transition-colors">
              {label}
            </a>
          ))}
        </div>
      )}

      {/* ── 2. HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden mx-2 sm:mx-10 lg:mx-20 mt-3 sm:mt-4" style={{ minHeight: "clamp(520px, 82vh, 92vh)", borderRadius: "20px" }}>

        {/* Video background */}
        {prevIdx !== null && (
          <video
            key={`prev-${videos[prevIdx]}`}
            src={videos[prevIdx]}
            autoPlay muted playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: "scale(1.04)", animation: "videoFadeOut 0.9s ease forwards" }}
          />
        )}
        <video
          ref={videoRef}
          key={`curr-${videos[videoIdx]}`}
          src={videos[videoIdx]}
          autoPlay muted playsInline
          onEnded={() => advanceVideo((videoIdx + 1) % videos.length)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scale(1.04)", animation: "videoFadeIn 0.9s ease forwards" }}
        />

        {/* Gradient overlay — heavier on left for text legibility */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(108deg, rgba(8,18,28,0.84) 0%, rgba(8,18,28,0.62) 45%, rgba(8,18,28,0.28) 100%)" }} />
        {/* Bottom fade so controls sit on a readable surface */}
        <div className="absolute bottom-0 left-0 right-0 h-40" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }} />
        {/* Subtle dot grid texture */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.05 }} aria-hidden="true">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dotGrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotGrid)" />
          </svg>
        </div>

        {/* Text content */}
        <div className="relative z-10 flex items-center" style={{ minHeight: "clamp(520px, 82vh, 92vh)" }}>
          <div className="w-full max-w-7xl mx-auto px-5 sm:px-14 lg:px-20 pt-10 pb-28">
            <div className="max-w-[680px]">

              <h1 className="text-[2.4rem] sm:text-5xl xl:text-[64px] text-white leading-[1.06] tracking-tight mb-4 sm:mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>
                Will your project<br />get approved?
              </h1>
              <p className="text-[rgba(255,255,255,0.68)] text-base sm:text-lg font-semibold leading-relaxed max-w-[480px] mb-7 sm:mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
                Real approval odds, 20 automated site checks, and AI-drafted documents — before you spend a penny on architects.
              </p>

              {/* Search form — stacked on mobile, pill on desktop */}
              <form onSubmit={handleSearch} className="w-full sm:max-w-[620px]">
                {/* Mobile: stacked */}
                <div className="flex flex-col gap-2 sm:hidden">
                  <div className="flex items-center bg-white rounded-2xl px-4 py-0" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}>
                    <svg className="w-4 h-4 shrink-0 mr-3" style={{ color: "#D4922A" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <input
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="Postcode or address"
                      className="flex-1 py-4 text-sm text-[#0b1d28] placeholder-[#9ca3af] outline-none bg-transparent"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#D4922A] text-white font-bold rounded-2xl py-4 text-base hover:bg-[#b87820] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Get my free planning score →
                  </button>
                </div>
                {/* Desktop: pill */}
                <div className="hidden sm:flex items-center p-1.5" style={{ background: "white", borderRadius: 100, boxShadow: "0 8px 40px rgba(0,0,0,0.22)" }}>
                  <div className="flex items-center pl-4 pr-2 shrink-0">
                    <svg className="w-5 h-5 shrink-0" style={{ color: "#D4922A" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <input
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="Enter your postcode or address"
                    className="flex-1 py-3 pr-2 text-base text-[#0b1d28] placeholder-[#9ca3af] outline-none bg-transparent"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <button type="submit" className="bg-[#D4922A] text-white font-bold whitespace-nowrap hover:bg-[#b87820] transition-colors shrink-0" style={{ padding: "14px 24px", borderRadius: 100, fontSize: 15, fontFamily: "'Inter', sans-serif" }}>
                    Get free score →
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>

        {/* Trust badges — bottom right, desktop only */}
        <div className="hidden sm:flex absolute bottom-0 right-0 z-10 items-end gap-2 px-5 sm:px-14 lg:px-20 pb-5 sm:pb-8">
          {[
            { val: "320+",  label: "councils covered" },
            { val: "4.9 ★", label: "avg rating"       },
            { val: "2 min", label: "to your score"    },
          ].map((b) => (
            <div key={b.val} className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.16)" }}>
              <span className="text-sm font-bold text-white">{b.val}</span>
              <span className="text-xs text-white/55">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── COUNCILS TICKER ────────────────────────────────────────────────── */}
      <div className="bg-white pt-6 pb-2 overflow-hidden">
        <div className="flex items-center gap-4 mb-3 px-4 sm:px-16 lg:px-32">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9ca3af] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>320+ councils covered</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, white, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, white, transparent)" }} />
          {/* Scrolling track */}
          <div className="flex gap-6 w-max" style={{ animation: "councilScroll 35s linear infinite" }}>
            {[
              "London Borough of Hackney", "Leeds City Council", "Manchester City Council",
              "Royal Borough of Kensington & Chelsea", "Bristol City Council",
              "Birmingham City Council", "Sheffield City Council", "Brighton & Hove",
              "Oxford City Council", "Cambridge City Council", "Liverpool City Council",
              "London Borough of Islington", "Southwark Council", "Tower Hamlets",
              "Wandsworth Council", "Richmond upon Thames", "Lambeth Council",
              "Hertsmere Borough Council", "Elmbridge Borough Council", "Guildford Borough Council",
              "London Borough of Hackney", "Leeds City Council", "Manchester City Council",
              "Royal Borough of Kensington & Chelsea", "Bristol City Council",
              "Birmingham City Council", "Sheffield City Council", "Brighton & Hove",
              "Oxford City Council", "Cambridge City Council", "Liverpool City Council",
              "London Borough of Islington", "Southwark Council", "Tower Hamlets",
            ].map((c, i) => (
              <span key={i} className="text-sm font-medium text-[#6b7280] whitespace-nowrap py-2 px-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. FEATURE CARDS ───────────────────────────────────────────────── */}
      <section className="bg-white pt-10 sm:pt-14 pb-6 sm:px-16 lg:px-32">
        <div className="w-full">
          {/* Header */}
          <div className="mb-8 sm:mb-10 px-4 sm:px-0">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0b1d28] mb-3 flex items-center gap-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Everything you need, in 2 minutes
              <span style={{ color: "#D4922A", fontSize: "0.85em" }}>✦</span>
            </h2>
            <p className="text-[#6b7280] text-base max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
              From your address to a full planning assessment — no architect, no waiting, no jargon.
            </p>
          </div>

          {/* Cards — horizontal scroll on mobile, grid on desktop */}
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory sm:snap-none pb-4 sm:pb-0 px-4 sm:px-0 scrollbar-hide">
            {([
              {
                bg: "linear-gradient(155deg, #b86d10 0%, #0b1d28 130%)",
                title: "Your approval odds",
                desc: "Based on your council's real decision history — not a guess.",
                illustration: (
                  <svg viewBox="0 0 200 180" preserveAspectRatio="xMidYMid slice" fill="none" className="w-full h-full">
                    {/* Outer rings */}
                    <circle cx="100" cy="96" r="76" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
                    <circle cx="100" cy="96" r="58" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                    {/* Arc track */}
                    <circle cx="100" cy="96" r="76" stroke="rgba(255,255,255,0.14)" strokeWidth="12" strokeLinecap="round"
                      strokeDasharray="358 478" transform="rotate(135 100 96)"/>
                    {/* Arc fill ~74% */}
                    <circle cx="100" cy="96" r="76" stroke="white" strokeWidth="12" strokeLinecap="round"
                      strokeDasharray="265 478" transform="rotate(135 100 96)"/>
                    {/* Score */}
                    <text x="100" y="90" fill="white" fontSize="42" fontWeight="800" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif">74</text>
                    <text x="100" y="110" fill="rgba(255,255,255,0.6)" fontSize="14" textAnchor="middle" fontFamily="Inter, sans-serif">% likely approved</text>
                    {/* Tick markers */}
                    {[0,1,2,3,4].map(n => {
                      const a = (135 + n * 67.5) * Math.PI / 180;
                      return <line key={n} x1={100 + 86*Math.cos(a)} y1={96 + 86*Math.sin(a)} x2={100 + 93*Math.cos(a)} y2={96 + 93*Math.sin(a)} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>;
                    })}
                  </svg>
                ),
              },
              {
                bg: "linear-gradient(155deg, #0d3a4a 0%, #0b1d28 130%)",
                title: "20 automated site checks",
                desc: "Conservation areas, green belt, flood zones and more — all verified instantly.",
                illustration: (
                  <svg viewBox="0 0 200 180" preserveAspectRatio="xMidYMid slice" fill="none" className="w-full h-full">
                    {/* Grid lines */}
                    {[40,80,120,160].map(x => <line key={`v${x}`} x1={x} y1="15" x2={x} y2="158" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>)}
                    {[50,90,130].map(y => <line key={`h${y}`} x1="15" y1={y} x2="185" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>)}
                    {/* House outline — slightly larger */}
                    <path d="M100 38L146 72V138H54V72L100 38Z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinejoin="round"/>
                    <rect x="86" y="106" width="28" height="32" rx="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
                    {/* Constraint pins — larger radius for readability */}
                    <circle cx="52" cy="64" r="11" fill="rgba(212,146,42,0.3)" stroke="#D4922A" strokeWidth="1.5"/>
                    <text x="52" y="68" fill="#D4922A" fontSize="10" textAnchor="middle" fontWeight="700">A4</text>
                    <circle cx="152" cy="50" r="11" fill="rgba(55,176,170,0.2)" stroke="rgb(55,176,170)" strokeWidth="1.5"/>
                    <text x="152" y="54" fill="rgb(55,176,170)" fontSize="10" textAnchor="middle" fontWeight="700">CA</text>
                    <circle cx="148" cy="132" r="11" fill="rgba(100,160,255,0.2)" stroke="rgba(100,160,255,0.8)" strokeWidth="1.5"/>
                    <text x="148" y="136" fill="rgba(100,160,255,0.9)" fontSize="10" textAnchor="middle" fontWeight="700">FZ</text>
                    <circle cx="46" cy="132" r="11" fill="rgba(200,80,80,0.2)" stroke="rgba(200,80,80,0.8)" strokeWidth="1.5"/>
                    <text x="46" y="136" fill="rgba(200,80,80,0.9)" fontSize="10" textAnchor="middle" fontWeight="700">LB</text>
                    {/* Check badges row */}
                    {[0,1,2,3,4,5].map(n => (
                      <g key={n} transform={`translate(${17 + n*30}, 156)`}>
                        <rect x="0" y="0" width="24" height="16" rx="4" fill="rgba(55,176,170,0.2)" stroke="rgba(55,176,170,0.4)" strokeWidth="1"/>
                        <path d="M8 8l3.5 3.5 5.5-6" stroke="rgb(55,176,170)" strokeWidth="1.4" strokeLinecap="round"/>
                      </g>
                    ))}
                  </svg>
                ),
              },
              {
                bg: "linear-gradient(155deg, #1a2d50 0%, #0b1d28 130%)",
                title: "Documents ready to submit",
                desc: "AI-drafted Design & Access Statement, Planning Statement and Cover Letter.",
                illustration: (
                  <svg viewBox="0 0 200 180" preserveAspectRatio="xMidYMid slice" fill="none" className="w-full h-full">
                    {/* Doc 3 (back) — large */}
                    <rect x="38" y="14" width="114" height="148" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.11)" strokeWidth="1.5" transform="rotate(-9 95 88)"/>
                    {/* Doc 2 (mid) */}
                    <rect x="38" y="10" width="114" height="148" rx="8" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" transform="rotate(5 95 84)"/>
                    {/* Doc 1 (front) */}
                    <rect x="30" y="6" width="114" height="148" rx="8" fill="rgba(255,255,255,0.11)" stroke="rgba(255,255,255,0.32)" strokeWidth="2"/>
                    {/* Title bar */}
                    <rect x="44" y="22" width="72" height="8" rx="4" fill="white" opacity="0.75"/>
                    {/* Text lines */}
                    <rect x="44" y="40" width="66" height="4" rx="2" fill="white" opacity="0.3"/>
                    <rect x="44" y="51" width="74" height="4" rx="2" fill="white" opacity="0.22"/>
                    <rect x="44" y="62" width="60" height="4" rx="2" fill="white" opacity="0.18"/>
                    <rect x="44" y="73" width="70" height="4" rx="2" fill="white" opacity="0.22"/>
                    <rect x="44" y="88" width="56" height="4" rx="2" fill="white" opacity="0.16"/>
                    <rect x="44" y="99" width="64" height="4" rx="2" fill="white" opacity="0.13"/>
                    <rect x="44" y="110" width="50" height="4" rx="2" fill="white" opacity="0.10"/>
                    {/* Checkmark badge — overlaps bottom-right of doc */}
                    <circle cx="144" cy="132" r="24" fill="rgb(55,176,170)"/>
                    <path d="M134 132l7 7 14-14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                bg: "linear-gradient(155deg, #1a3828 0%, #0b1d28 130%)",
                title: "Built on real UK data",
                desc: "23 million planning decisions across 320+ councils.",
                illustration: (
                  <svg viewBox="0 0 200 180" preserveAspectRatio="xMidYMid slice" fill="none" className="w-full h-full">
                    {/* Grid */}
                    {[50,90,130,155].map(y => <line key={y} x1="14" y1={y} x2="186" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>)}
                    {/* Bars — centred: total span = 5×28 + 4×8 = 172, start = (200−172)/2 = 14 */}
                    {[
                      { x: 14,  h: 76, label: "LDN", pct: "89%" },
                      { x: 50,  h: 60, label: "MCR", pct: "78%" },
                      { x: 86,  h: 68, label: "BRS", pct: "83%" },
                      { x: 122, h: 52, label: "LDS", pct: "71%" },
                      { x: 158, h: 64, label: "BHM", pct: "80%" },
                    ].map((b) => (
                      <g key={b.x}>
                        <rect x={b.x} y={158 - b.h} width="28" height={b.h} rx="5" fill="rgba(55,176,170,0.25)" stroke="rgba(55,176,170,0.5)" strokeWidth="1"/>
                        <rect x={b.x} y={158 - b.h} width="28" height="7" rx="5" fill="rgb(55,176,170)"/>
                        <text x={b.x + 14} y={148 - b.h} fill="white" fontSize="10" textAnchor="middle" fontWeight="600" fontFamily="Inter, sans-serif">{b.pct}</text>
                        <text x={b.x + 14} y="170" fill="rgba(255,255,255,0.45)" fontSize="9" textAnchor="middle" fontFamily="Inter, sans-serif">{b.label}</text>
                      </g>
                    ))}
                    {/* Big stat */}
                    <text x="100" y="30" fill="white" fontSize="24" fontWeight="800" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif">23M</text>
                    <text x="100" y="43" fill="rgba(255,255,255,0.45)" fontSize="10" textAnchor="middle" fontFamily="Inter, sans-serif">planning decisions analysed</text>
                  </svg>
                ),
              },
            ] as { bg: string; title: string; desc: string; illustration: React.ReactNode }[]).map((card, i) => (
              <Link
                key={i}
                href="/dashboard/projects/new"
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-end snap-start flex-none sm:flex-1 w-[82vw] sm:w-auto"
                style={{ height: "52vh", minHeight: 340, textDecoration: "none", background: card.bg }}
              >
                {/* Illustration — fills upper 60% of card */}
                <div className="absolute inset-x-0 top-0 bottom-[30%] flex items-center justify-center p-5 pointer-events-none">
                  {card.illustration}
                </div>

                {/* Bottom fade */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,18,28,0.95) 0%, rgba(8,18,28,0.2) 55%, transparent 100%)" }} />

                {/* Arrow */}
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors group-hover:bg-white/30"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 9.5l7-7M9.5 9.5V2.5H2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Text */}
                <div className="relative z-10 p-5 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {card.title}
                  </h3>
                  <p className="text-white/65 text-sm sm:text-base leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {card.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEW ─────────────────────────────────────────────────────────── */}
      <section className="bg-white pb-6 px-2 sm:px-16 lg:px-32">
        <div className="rounded-2xl sm:rounded-3xl px-8 sm:px-12 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12" style={{ background: "rgb(234,245,245)", border: "1.5px solid rgb(210,236,236)" }}>
          <div className="flex-1">
            <div className="flex gap-0.5 mb-4">
              {[1,2,3,4,5].map(n => <Star key={n} />)}
            </div>
            <p className="text-[#0b1d28] text-lg sm:text-xl leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              &ldquo;We were about to pay an architect £3,000 for plans. PlanningPerm gave us a 78% approval score in 2 minutes — with all three planning documents ready to submit.&rdquo;
            </p>
          </div>
          <div className="shrink-0">
            <p className="text-sm font-semibold text-[#0b1d28]" style={{ fontFamily: "'Inter', sans-serif" }}>Daniel & Emma W.</p>
            <p className="text-xs text-[#6b7280] mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Leeds</p>
          </div>
        </div>
      </section>

      {/* ── MONZO-STYLE ALTERNATING PANELS ─────────────────────────────────── */}

      {/* Panel 1: text left, visual right */}
      <section className="bg-white px-4 sm:px-16 lg:px-32 py-20 sm:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-20 items-center">
          <div>
            <h2 className="text-[2rem] sm:text-5xl xl:text-[56px] font-extrabold text-[#0b1d28] leading-[1.08] tracking-tight mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Know your odds before you brief an architect.
            </h2>
            <p className="text-[#6b7280] text-lg leading-relaxed mb-8 max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
              PlanningPerm shows your real approval probability based on your council&apos;s decision history — so you invest with confidence, not hope.
            </p>
            <Link href="/dashboard/projects/new" className="inline-block bg-[#0b1d28] text-white rounded-full px-7 py-4 text-sm font-semibold hover:bg-[#1a3040] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
              Check my property — it&apos;s free
            </Link>
          </div>
          {/* Visual: score gauge card */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(155deg, #b86d10 0%, #0b1d28 110%)", minHeight: 340 }}>
            <svg viewBox="0 0 280 260" fill="none" className="w-full h-full" style={{ maxHeight: 380 }}>
              <circle cx="140" cy="138" r="96" stroke="rgba(255,255,255,0.07)" strokeWidth="2"/>
              <circle cx="140" cy="138" r="74" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              {/* Arc track */}
              <circle cx="140" cy="138" r="96" stroke="rgba(255,255,255,0.14)" strokeWidth="16" strokeLinecap="round"
                strokeDasharray="452 603" transform="rotate(135 140 138)"/>
              {/* Arc fill 74% */}
              <circle cx="140" cy="138" r="96" stroke="white" strokeWidth="16" strokeLinecap="round"
                strokeDasharray="335 603" transform="rotate(135 140 138)"/>
              {/* Score */}
              <text x="140" y="128" fill="white" fontSize="56" fontWeight="800" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif">74</text>
              <text x="140" y="152" fill="rgba(255,255,255,0.6)" fontSize="17" textAnchor="middle" fontFamily="Inter, sans-serif">% likely approved</text>
              {/* Council label */}
              <rect x="94" y="172" width="92" height="26" rx="13" fill="rgba(212,146,42,0.25)" stroke="rgba(212,146,42,0.5)" strokeWidth="1"/>
              <text x="140" y="189" fill="#D4922A" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="Inter, sans-serif">Camden Council</text>
              {/* Tick marks */}
              {[0,1,2,3,4].map(n => {
                const a = (135 + n * 67.5) * Math.PI / 180;
                return <line key={n} x1={140 + 108*Math.cos(a)} y1={138 + 108*Math.sin(a)} x2={140 + 116*Math.cos(a)} y2={138 + 116*Math.sin(a)} stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>;
              })}
            </svg>
          </div>
        </div>
      </section>

      {/* Panel 2: visual left, text right */}
      <section className="bg-white px-4 sm:px-16 lg:px-32 py-20 sm:py-28 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-20 items-center">
          {/* Visual: checklist card */}
          <div className="order-2 md:order-1 rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(155deg, #0d3a4a 0%, #0b1d28 110%)", minHeight: 340 }}>
            <svg viewBox="0 0 280 260" fill="none" className="w-full h-full" style={{ maxHeight: 380 }}>
              {/* Background grid */}
              {[60,110,160,210].map(x => <line key={`v${x}`} x1={x} y1="20" x2={x} y2="240" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>)}
              {[60,100,140,180,220].map(y => <line key={`h${y}`} x1="20" y1={y} x2="260" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>)}
              {/* Check rows */}
              {[
                { y: 52,  label: "Conservation area",  pass: true  },
                { y: 88,  label: "Listed building",    pass: true  },
                { y: 124, label: "Green belt",         pass: false },
                { y: 160, label: "Flood zone 2 or 3",  pass: true  },
                { y: 196, label: "Article 4 direction", pass: true  },
              ].map(row => (
                <g key={row.y}>
                  <rect x="30" y={row.y - 18} width="220" height="32" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.09)" strokeWidth="1"/>
                  <circle cx="55" cy={row.y - 2} r="11" fill={row.pass ? "rgba(55,176,170,0.25)" : "rgba(200,80,80,0.2)"} stroke={row.pass ? "rgb(55,176,170)" : "rgba(200,80,80,0.8)"} strokeWidth="1.5"/>
                  {row.pass
                    ? <path d={`M49 ${row.y - 2}l4 4 8-8`} stroke="rgb(55,176,170)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    : <path d={`M51 ${row.y - 6}l8 8M59 ${row.y - 6}l-8 8`} stroke="rgba(200,80,80,0.9)" strokeWidth="1.8" strokeLinecap="round"/>
                  }
                  <text x="74" y={row.y + 3} fill="rgba(255,255,255,0.8)" fontSize="13" fontFamily="Inter, sans-serif">{row.label}</text>
                  <text x="236" y={row.y + 3} fill={row.pass ? "rgb(55,176,170)" : "rgba(200,80,80,0.9)"} fontSize="12" fontWeight="600" textAnchor="middle" fontFamily="Inter, sans-serif">{row.pass ? "Clear" : "Flag"}</text>
                </g>
              ))}
            </svg>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-[2rem] sm:text-5xl xl:text-[56px] font-extrabold text-[#0b1d28] leading-[1.08] tracking-tight mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Every constraint, checked in seconds.
            </h2>
            <p className="text-[#6b7280] text-lg leading-relaxed mb-8 max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
              Conservation areas, listed buildings, green belt, flood zones, Article 4 — 20 site checks run the moment you enter your address. No manual research, no surprises later.
            </p>
            <Link href="/dashboard/projects/new" className="inline-block bg-[#0b1d28] text-white rounded-full px-7 py-4 text-sm font-semibold hover:bg-[#1a3040] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
              Run my site checks
            </Link>
          </div>
        </div>
      </section>

      {/* Panel 3: text left, visual right */}
      <section className="bg-white px-4 sm:px-16 lg:px-32 py-20 sm:py-28 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-20 items-center">
          <div>
            <h2 className="text-[2rem] sm:text-5xl xl:text-[56px] font-extrabold text-[#0b1d28] leading-[1.08] tracking-tight mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Submit-ready documents, without the consultant.
            </h2>
            <p className="text-[#6b7280] text-lg leading-relaxed mb-8 max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
              AI-drafted Design & Access Statement, Planning Statement, and Cover Letter — tailored to your project and ready to attach to your planning portal submission.
            </p>
            <Link href="/dashboard/projects/new" className="inline-block bg-[#0b1d28] text-white rounded-full px-7 py-4 text-sm font-semibold hover:bg-[#1a3040] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
              See a sample report
            </Link>
          </div>
          {/* Visual: document stack card */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(155deg, #1a2d50 0%, #0b1d28 110%)", minHeight: 340 }}>
            <svg viewBox="0 0 280 260" fill="none" className="w-full h-full" style={{ maxHeight: 380 }}>
              {/* Doc 3 (back) */}
              <rect x="56" y="24" width="150" height="196" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" strokeWidth="2" transform="rotate(-9 131 122)"/>
              {/* Doc 2 (mid) */}
              <rect x="56" y="18" width="150" height="196" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" transform="rotate(5 131 116)"/>
              {/* Doc 1 (front) */}
              <rect x="46" y="12" width="150" height="196" rx="12" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.28)" strokeWidth="2"/>
              {/* Title */}
              <rect x="62" y="30" width="96" height="10" rx="5" fill="white" opacity="0.75"/>
              {/* Text lines */}
              <rect x="62" y="52" width="88" height="5" rx="2.5" fill="white" opacity="0.28"/>
              <rect x="62" y="64" width="100" height="5" rx="2.5" fill="white" opacity="0.22"/>
              <rect x="62" y="76" width="80" height="5" rx="2.5" fill="white" opacity="0.18"/>
              <rect x="62" y="88" width="92" height="5" rx="2.5" fill="white" opacity="0.22"/>
              <rect x="62" y="104" width="76" height="5" rx="2.5" fill="white" opacity="0.15"/>
              <rect x="62" y="116" width="86" height="5" rx="2.5" fill="white" opacity="0.13"/>
              <rect x="62" y="128" width="68" height="5" rx="2.5" fill="white" opacity="0.10"/>
              {/* Checkmark */}
              <circle cx="196" cy="180" r="32" fill="rgb(55,176,170)"/>
              <path d="M182 180l10 10 20-20" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── 5. THREE-COLUMN FEATURES ───────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-16 sm:py-20 px-4 sm:px-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            {[
              {
                icon: <SketchScore />,
                heading: "Your planning score",
                body: "A genuine approval probability based on your council's real decision history and national policy — not a generic estimate.",
              },
              {
                icon: <SketchMap />,
                heading: "20 site checks",
                body: "Conservation areas, listed buildings, green belt, flood zones, Article 4, AONB, National Parks, SSSIs, SACs, SPAs, Ramsar sites, TPOs, scheduled monuments, World Heritage Sites, and more — all checked automatically in seconds.",
              },
              {
                icon: <SketchDoc />,
                heading: "Documents to submit",
                body: "Design & Access Statement, Planning Statement, Cover Letter — AI-drafted and ready to attach to your planning portal submission.",
              },
            ].map((col, i) => (
              <div key={i} className="text-center px-4">
                {col.icon}
                <h3 className="text-xl font-normal text-[#D4922A] tracking-tight mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  {col.heading}
                </h3>
                <p className="text-[#2d3843] leading-relaxed text-base">{col.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/dashboard/projects/new" className="border-2 border-[#0b1d28] text-[#0b1d28] rounded-full px-10 py-3.5 text-sm font-semibold hover:bg-[#0b1d28] hover:text-white transition-colors">
              See how {BRAND} works in detail
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. TESTIMONIAL BANNER #2 ───────────────────────────────────────── */}
      <TestimonialBanner
        name="James T."
        location="Bristol"
        quote="I'd been quoted £1,800 for a planning consultant. PlanningPerm gave me the same analysis in minutes and wrote all three documents for me. Total cost: £20."
      />

      {/* ── 7. BUILT ON REAL DATA ──────────────────────────────────────────── */}
      <section className="bg-white py-14 sm:py-28 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 items-center">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl sm:text-5xl font-normal text-[#0b1d28] leading-[1.05] tracking-tight mb-5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Built on real<br />planning data.<br />Not guesswork.
            </h2>
            <p className="text-[#2d3843] leading-relaxed mb-3 text-base">
              If your council is approving 89% of rear extensions in your postcode, you&apos;ll know. If an Article 4 direction removes your permitted development rights, you&apos;ll know that too — before you speak to an architect.
            </p>
            <p className="leading-relaxed mb-8 text-base font-medium" style={{ color: "rgb(55,176,170)" }}>
              Based on 23 million real UK planning decisions — not a formula we invented.
            </p>
            <Link href="/dashboard/projects/new" className="inline-block border-2 border-[#0b1d28] text-[#0b1d28] rounded-full px-8 py-3.5 text-sm font-semibold hover:bg-[#0b1d28] hover:text-white transition-colors">
              Check my property — it&apos;s free
            </Link>
          </div>

          {/* Council search */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#2d3843] mb-4">
              Is your council covered?
            </p>
            <div className="flex items-center gap-3 bg-[#eaf5f5] rounded-2xl px-5 py-4 mb-4">
              <svg className="w-5 h-5 text-[#D4922A] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={councilSearch}
                onChange={e => setCouncilSearch(e.target.value)}
                placeholder="Search your council, e.g. Leeds, Hackney…"
                className="flex-1 text-base text-[#0b1d28] placeholder-[#9ca3af] outline-none bg-transparent"
                style={{ fontFamily: "'Euclid Circular B', sans-serif" }}
              />
            </div>
            {councilSearch.trim().length > 1 && (
              <div className="rounded-2xl px-5 py-4 mb-4 text-sm font-medium" style={{
                background: councilMatch ? "rgba(55,176,170,0.08)" : "rgba(212,146,42,0.08)",
                border: `1.5px solid ${councilMatch ? "rgba(55,176,170,0.3)" : "rgba(212,146,42,0.3)"}`,
                color: councilMatch ? "rgb(55,176,170)" : "#D4922A",
              }}>
                {councilMatch
                  ? `✓ ${councilMatch} is covered.`
                  : "We may still cover your council — enter your postcode to check."}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {sampleCouncils.slice(0, 8).map(c => (
                <span key={c} className="text-xs bg-white border border-[#d0e8e8] text-[#2d3843] rounded-full px-3 py-1">{c}</span>
              ))}
              <span className="text-xs bg-[#D4922A] text-white rounded-full px-3 py-1 font-semibold">+310 more</span>
            </div>
            <p className="text-sm text-[#2d3843] mt-4 opacity-70">320+ councils across England & Wales covered with live decision data.</p>
          </div>
        </div>
      </section>

      {/* ── 8. COMPARISON TABLE ────────────────────────────────────────────── */}
      <section id="pricing" className="bg-[#eaf5f5] py-16 sm:py-28 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-normal text-[#0b1d28] tracking-tight text-center mb-10 sm:mb-14" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            {BRAND} vs. the<br />alternatives
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-5 text-sm font-semibold text-[#0b1d28] w-1/2">What you get</th>
                  <th className="text-center px-6 py-5 text-sm font-bold text-[#D4922A]">{BRAND}</th>
                  <th className="text-center px-6 py-5 text-sm font-semibold text-[#2d3843]">Planning consultant</th>
                  <th className="text-center px-6 py-5 text-sm font-semibold text-[#2d3843]">DIY</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={i} className={`border-t border-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/60"}`}>
                    <td className="px-6 py-4 text-base text-[#0b1d28] leading-relaxed">{row.feature}</td>
                    <td className="text-center px-6 py-4">{row.pp          ? <Check /> : <Dash />}</td>
                    <td className="text-center px-6 py-4">{row.consultant  ? <Check /> : <Dash />}</td>
                    <td className="text-center px-6 py-4">{row.diy        ? <Check /> : <Dash />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm text-[#2d3843] mt-6">Planning consultants typically charge £800–£2,500 for the same analysis. {BRAND}: £20.</p>
        </div>
      </section>



      {/* ── 12. FINAL CTA ──────────────────────────────────────────────────── */}
      <section className="bg-[#0e1e30] py-20 sm:py-32 px-4 sm:px-8 text-center">
        <SketchPersonDoc />
        <h2 className="text-3xl sm:text-5xl xl:text-6xl font-normal text-white leading-[1.05] tracking-tight mb-6" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          Get your free planning<br />score today
        </h2>
        <p className="text-[rgba(255,255,255,0.70)] text-lg mb-10 max-w-md mx-auto leading-relaxed">
          Enter your postcode, tell us what you want to build, and get a real approval score in under 2 minutes — free.
        </p>
        <Link href="/dashboard/projects/new" className="inline-block bg-[#D4922A] text-white rounded-full px-12 py-4 text-sm font-bold hover:bg-[#b87820] transition-colors">
          Check my property — it's free
        </Link>
        <p className="text-[#5a9494] text-sm mt-4">No account needed · Preview free · Full report & documents £20</p>
      </section>

      {/* ── 13. FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#eaf5f5] px-4 sm:px-8 pt-14 pb-10">
        <div className="max-w-6xl mx-auto">
          {/* Top row */}
          <div className="flex flex-col lg:flex-row justify-between gap-12 mb-10">
            {/* Brand */}
            <div className="shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <LogoIcon className="w-6 h-6 text-[#D4922A]" />
                <span className="text-[#0b1d28] text-lg font-normal lowercase" style={{ fontFamily: "'Clash Display', sans-serif" }}>{BRAND}</span>
              </div>
              <p className="text-[#2d3843] text-sm mb-1">AI-powered planning permission guidance</p>
              <p className="text-[#2d3843] text-sm mb-1">for UK homeowners.</p>
              <a href="mailto:hello@planningperm.com" className="text-[#D4922A] text-sm font-semibold hover:underline mt-3 inline-block">
                hello@planningperm.com
              </a>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {[
                { heading: "Product", links: [
                  ["Check my property", "/dashboard/projects/new"],
                  ["Dashboard", "/dashboard"],
                  ["My documents", "/dashboard/documents"],
                ]},
                { heading: "Resources", links: [
                  ["Planning guides", "/blog"],
                  ["Conservatory rules", "/blog/do-you-need-planning-permission-for-a-conservatory"],
                  ["Planning costs", "/blog/how-much-does-planning-permission-cost-uk"],
                  ["Solar panels", "/blog/do-you-need-planning-permission-for-solar-panels"],
                  ["Pergolas", "/blog/do-you-need-planning-permission-for-a-pergola"],
                ]},
                { heading: "Legal", links: [
                  ["Privacy policy", "/privacy"],
                  ["Terms & conditions", "/terms"],
                  ["Complaints", "mailto:hello@planningperm.com?subject=Complaint"],
                ]},
              ].map((col) => (
                <div key={col.heading}>
                  <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-[#0b1d28] mb-4">{col.heading}</p>
                  {col.links.map(([label, href]) => (
                    <a key={label} href={href} className="block text-sm text-[#2d3843] mb-2.5 hover:text-[#0b1d28] transition-colors">
                      {label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-[#d0e8e8] mb-6" />

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-[#9ca3af]">
            <p>© {new Date().getFullYear()} PlanningPerm. All rights reserved.</p>
            <p>Planning data sourced from Planning Portal, OS, and Environment Agency open data.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
