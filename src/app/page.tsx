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
  const videos = ["/hero.mp4", "/hero2.mp4", "/hero3.mp4"];
  const [videoIdx, setVideoIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function advanceVideo(next: number) {
    setPrevIdx(videoIdx);
    setFading(true);
    setVideoIdx(next);
    setTimeout(() => { setPrevIdx(null); setFading(false); }, 800);
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
    <div className="font-sans text-[#0b1d28] overflow-x-hidden" style={{ fontFamily: "'Euclid Circular B', sans-serif" }}>

      {/* ── 1. NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoIcon className="w-7 h-7 text-[#D4922A]" />
          <span className="text-[#0b1d28] text-xl font-normal lowercase tracking-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>{BRAND}</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.14em] font-semibold text-[#0b1d28]">
          {[
            ["How it works", "#how-it-works"],
            ["Pricing",       "#pricing"],
            ["Blog",          "/blog"],
          ].map(([label, href]) => (
            <a key={label} href={href} className="hover:text-[#D4922A] transition-colors whitespace-nowrap">{label}</a>
          ))}
        </div>

        <Link href="/dashboard/projects/new" className="bg-[#D4922A] text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-[#b87820] transition-colors whitespace-nowrap">
          Check my property
        </Link>
      </nav>

      {/* ── 2. HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden mx-4 sm:mx-10 lg:mx-20" style={{ minHeight: "88vh", borderRadius: "24px" }}>

        {/* Video background */}
        {prevIdx !== null && (
          <video
            key={`prev-${videos[prevIdx]}`}
            src={videos[prevIdx]}
            autoPlay muted playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: fading ? 0 : 1, transition: "opacity 0.8s ease", transform: "scale(1.04)" }}
          />
        )}
        <video
          ref={videoRef}
          key={`curr-${videos[videoIdx]}`}
          src={videos[videoIdx]}
          autoPlay muted playsInline
          onEnded={() => advanceVideo((videoIdx + 1) % videos.length)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scale(1.04)" }}
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
        <div className="relative z-10 flex items-center" style={{ minHeight: "88vh" }}>
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-14 lg:px-20 pt-8 pb-24">
            <div className="max-w-[600px]">

              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-normal text-white leading-[1.02] tracking-tight mb-5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Know before<br />you build.
              </h1>
              <p className="text-[rgba(255,255,255,0.68)] text-lg leading-relaxed max-w-[480px] mb-8">
                Real approval odds for your property — based on your council&apos;s actual decision history. 20 site checks, AI-drafted documents, ready in under 2 minutes.
              </p>

              {/* Search form */}
              <form onSubmit={handleSearch} className="max-w-[580px]">
                <div className="flex items-center p-1.5" style={{ background: "white", borderRadius: 100, boxShadow: "0 8px 40px rgba(0,0,0,0.22)" }}>
                  <div className="flex items-center pl-4 pr-2 shrink-0">
                    <svg className="w-5 h-5 shrink-0" style={{ color: "#D4922A" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <input
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="Enter your postcode or address"
                    className="flex-1 py-3 pr-2 text-base text-[#0b1d28] placeholder-[#9ca3af] outline-none bg-transparent"
                    style={{ fontFamily: "'Euclid Circular B', sans-serif" }}
                  />
                  <button
                    type="submit"
                    className="bg-[#D4922A] text-white font-bold whitespace-nowrap hover:bg-[#b87820] transition-colors shrink-0"
                    style={{ padding: "14px 24px", borderRadius: 100, fontSize: 15 }}
                  >
                    Get free score →
                  </button>
                </div>
                <p className="text-[rgba(255,255,255,0.45)] text-xs mt-3 pl-5">Free during beta · No account needed</p>
              </form>

            </div>
          </div>
        </div>

        {/* Bottom bar — arrows + dots left · trust badges right */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between px-6 sm:px-14 lg:px-20 pb-8">

          {/* Left: prev / dots / next */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => advanceVideo((videoIdx - 1 + videos.length) % videos.length)}
              aria-label="Previous"
              className="flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
              style={{ width: 38, height: 38, border: "1.5px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(4px)" }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M8.5 1.5L3.5 6.5l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex items-center gap-1.5">
              {videos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => advanceVideo(i)}
                  className="rounded-full transition-all duration-300"
                  style={{ width: i === videoIdx ? 20 : 6, height: 6, background: i === videoIdx ? "white" : "rgba(255,255,255,0.38)" }}
                  aria-label={`Video ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => advanceVideo((videoIdx + 1) % videos.length)}
              aria-label="Next"
              className="flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
              style={{ width: 38, height: 38, border: "1.5px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(4px)" }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M4.5 1.5l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Right: trust badges (desktop only) */}
          <div className="hidden sm:flex items-center gap-2">
            {[
              { val: "320+",   label: "councils covered" },
              { val: "4.9 ★",  label: "avg rating"       },
              { val: "2 min",  label: "to your score"    },
            ].map((b) => (
              <div
                key={b.val}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.16)" }}
              >
                <span className="text-sm font-bold text-white">{b.val}</span>
                <span className="text-xs text-white/55">{b.label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 3. TESTIMONIAL BANNER ──────────────────────────────────────────── */}
      <TestimonialBanner
        name="Daniel & Emma W."
        location="Leeds"
        quote="We were about to pay an architect £3,000 for plans. PlanningPerm gave us a 78% approval score in 2 minutes — with all three planning documents ready to submit."
      />

      {/* ── 4. SOCIAL PROOF / BIG QUOTE ────────────────────────────────────── */}
      <section className="bg-white py-14 sm:py-28 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 items-center">
          <div className="rounded-2xl overflow-hidden h-[220px] sm:h-[420px]">
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&auto=format&fit=crop"
              alt="Homeowners reviewing their planning report"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xl sm:text-3xl xl:text-4xl font-normal italic text-[#0b1d28] leading-[1.3] mb-6" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              &ldquo;PlanningPerm showed me exactly what conservation area rules applied — and what didn&apos;t. We got permission first time.&rdquo;
            </p>
            <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#2d3843] mb-2">
              Priya S. · Hackney, London
            </p>
            <div className="flex justify-center sm:justify-start"><Stars /></div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────────────────────────────────── */}
      <section className="bg-[#eaf5f5] py-14 px-4 sm:px-8 border-t border-[#d0e8e8]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { val: "14,000+", label: "Homeowners assessed"  },
            { val: "320+",    label: "Councils covered"     },
            { val: "2 mins",  label: "Average time to score"},
            { val: "4.9 / 5", label: "Trustpilot rating"    },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl sm:text-4xl font-normal tracking-tight mb-1" style={{ fontFamily: "'Clash Display', sans-serif", color: "rgb(55,176,170)" }}>{s.val}</p>
              <p className="text-sm font-semibold text-[#0b1d28]">{s.label}</p>
            </div>
          ))}
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
