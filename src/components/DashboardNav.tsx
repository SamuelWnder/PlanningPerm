"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, FileText, Bell, User } from "lucide-react";
import { useGreeting } from "@/lib/use-greeting";

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
  const pathname = usePathname();
  const greeting = useGreeting();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

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
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <LogoIcon className="w-7 h-7" style={{ color: "#D4922A" } as React.CSSProperties} />
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

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={label} href={href} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px",
              borderRadius: 99999,
              background: active ? "rgba(212,146,42,0.10)" : "transparent",
              color: active ? "#D4922A" : "#0b1d28",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}>
              <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right — greeting + bell + CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#0b1d28", fontWeight: 500 }}>
          <User size={15} strokeWidth={1.6} style={{ color: "#2d3843" }} />
          {greeting}
        </span>
        <button aria-label="Notifications" style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "transparent", border: "none",
          cursor: "pointer", color: "#0b1d28",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Bell size={17} strokeWidth={1.6} />
        </button>
        <Link href="/dashboard/projects/new" style={{
          background: "#D4922A", color: "white",
          borderRadius: 99999, padding: "8px 18px",
          fontSize: 13, fontWeight: 600,
          textDecoration: "none", whiteSpace: "nowrap",
        }}>
          + New project
        </Link>
      </div>
    </nav>
  );
}
