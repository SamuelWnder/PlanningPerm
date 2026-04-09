"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, FileText, Bell } from "lucide-react";
import { useGreeting } from "@/lib/use-greeting";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const NAV_ITEMS = [
  { label: "Home",      href: "/dashboard",           icon: Home       },
  { label: "Projects",  href: "/dashboard/projects",  icon: FolderOpen },
  { label: "Documents", href: "/dashboard/documents", icon: FileText   },
];

function LogoIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export default function DashboardNav() {
  const pathname  = usePathname();
  const greeting  = useGreeting();
  const { isMobile } = useBreakpoint();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  // On mobile: show logo + icon-only nav + bell + CTA
  // On desktop: show logo + labelled nav + greeting + bell + CTA
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: 68,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: isMobile ? "0 16px" : "0 40px",
      background: "white",
      borderBottom: "1px solid #e8f0f0",
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
        <LogoIcon className="w-6 h-6" style={{ color: "#D4922A" } as React.CSSProperties} />
        {!isMobile && (
          <span style={{
            fontSize: 17, fontWeight: 400, color: "#0b1d28",
            letterSpacing: -0.3, fontFamily: "'Clash Display', sans-serif",
            textTransform: "lowercase",
          }}>
            planningperm
          </span>
        )}
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 0 : 2 }}>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={label} href={href} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: isMobile ? "8px 10px" : "7px 14px",
              borderRadius: 99999,
              background: active ? "rgba(212,146,42,0.10)" : "transparent",
              color: active ? "#D4922A" : "#0b1d28",
              textDecoration: "none",
              fontSize: 13, fontWeight: active ? 600 : 500,
              letterSpacing: "0.04em", textTransform: "uppercase",
              whiteSpace: "nowrap", transition: "all 0.15s",
            }}>
              <Icon size={isMobile ? 18 : 14} strokeWidth={active ? 2.2 : 1.8} />
              {!isMobile && label}
            </Link>
          );
        })}
      </div>

      {/* Right — greeting + bell + CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 8, flexShrink: 0 }}>
        {!isMobile && (
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#0b1d28", fontWeight: 500 }}>
            {greeting}
          </span>
        )}
        <button aria-label="Notifications" style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "transparent", border: "none",
          cursor: "pointer", color: "#0b1d28",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Bell size={17} strokeWidth={1.6} />
        </button>
        <Link href="/dashboard/projects/new" style={{
          background: "#D4922A", color: "white",
          borderRadius: 99999,
          padding: isMobile ? "7px 12px" : "8px 18px",
          fontSize: isMobile ? 12 : 13, fontWeight: 600,
          textDecoration: "none", whiteSpace: "nowrap",
        }}>
          {isMobile ? "+ New" : "+ New project"}
        </Link>
      </div>
    </nav>
  );
}
