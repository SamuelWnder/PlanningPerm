"use client";

import Link from "next/link";

function LogoIcon() {
  return (
    <svg className="w-7 h-7" style={{ color: "#D4922A" }} viewBox="0 0 36 36" fill="none">
      <rect x="23" y="8" width="4" height="7" rx="1" fill="currentColor" />
      <path d="M4 17L18 5L32 17H4Z" fill="currentColor" />
      <rect x="6" y="17" width="24" height="14" rx="1.5" fill="currentColor" />
      <path d="M12 24l4 4 8-9" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "For homeowners",   href: "/#" },
  { label: "For professionals", href: "/#" },
  { label: "How it works",     href: "/#" },
  { label: "Blog",             href: "/blog" },
];

export default function PublicNav() {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: 68,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px",
      background: "white",
      borderBottom: "1px solid #e8f0f0",
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <LogoIcon />
        <span style={{
          fontSize: 17,
          fontWeight: 400,
          color: "#0b1d28",
          letterSpacing: -0.3,
          fontFamily: "'Clash Display', sans-serif",
          textTransform: "lowercase",
        }}>
          PlanningPerm
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {NAV_LINKS.map(({ label, href }) => (
          <Link key={label} href={href} style={{
            color: "#0b1d28",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#D4922A")}
          onMouseLeave={e => (e.currentTarget.style.color = "#0b1d28")}
          >
            {label}
          </Link>
        ))}
      </div>

      <Link href="/dashboard/projects/new" style={{
        background: "#D4922A",
        color: "white",
        borderRadius: 99999,
        padding: "8px 20px",
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}>
        Check my property
      </Link>
    </nav>
  );
}
