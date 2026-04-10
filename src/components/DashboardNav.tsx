"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, FileText, Bell, X, Menu } from "lucide-react";
import { useGreeting } from "@/lib/use-greeting";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Home",      href: "/dashboard",           icon: Home       },
  { label: "Projects",  href: "/dashboard/projects",  icon: FolderOpen },
  { label: "Documents", href: "/dashboard/documents", icon: FileText   },
];

function LogoIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} viewBox="0 0 36 36" fill="none" width={28} height={28}>
      <rect x="23" y="8" width="4" height="7" rx="1" fill="currentColor" />
      <path d="M4 17L18 5L32 17H4Z" fill="currentColor" />
      <rect x="6" y="17" width="24" height="14" rx="1.5" fill="currentColor" />
      <path d="M12 24l4 4 8-9" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardNav() {
  const pathname      = usePathname();
  const greeting      = useGreeting();
  const { isMobile }  = useBreakpoint();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
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
          <LogoIcon style={{ color: "#D4922A" }} />
          <span style={{ fontSize: 17, fontWeight: 400, color: "#0b1d28", letterSpacing: -0.3, fontFamily: "'Clash Display', sans-serif", textTransform: "lowercase" }}>
            planningperm
          </span>
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link key={label} href={href} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 99999,
                  background: active ? "rgba(212,146,42,0.10)" : "transparent",
                  color: active ? "#D4922A" : "#0b1d28",
                  textDecoration: "none", fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  letterSpacing: "0.04em", textTransform: "uppercase",
                  whiteSpace: "nowrap", transition: "all 0.15s",
                }}>
                  <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Desktop right */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 14, color: "#0b1d28", fontWeight: 500 }}>{greeting}</span>
            <button aria-label="Notifications" style={{ width: 34, height: 34, borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", color: "#0b1d28", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={17} strokeWidth={1.6} />
            </button>
            <Link href="/dashboard/projects/new" style={{ background: "#D4922A", color: "white", borderRadius: 99999, padding: "8px 18px", fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
              + New project
            </Link>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#0b1d28", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        )}
      </nav>

      {/* Mobile drawer */}
      {isMobile && open && (
        <div style={{
          position: "fixed", top: 68, left: 0, right: 0, bottom: 0,
          zIndex: 99, background: "rgba(11,29,40,0.4)",
        }} onClick={() => setOpen(false)}>
          <div style={{
            background: "white", padding: "12px 16px 24px",
            borderBottom: "1px solid #e8f0f0",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }} onClick={e => e.stopPropagation()}>
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link key={label} href={href} onClick={() => setOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 12px", borderRadius: 12,
                  background: active ? "rgba(212,146,42,0.08)" : "transparent",
                  color: active ? "#D4922A" : "#0b1d28",
                  textDecoration: "none", fontSize: 16, fontWeight: active ? 600 : 500,
                  marginBottom: 4,
                }}>
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                  {label}
                </Link>
              );
            })}
            <div style={{ borderTop: "1px solid #e8f0f0", marginTop: 8, paddingTop: 16 }}>
              <Link href="/dashboard/projects/new" onClick={() => setOpen(false)} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#D4922A", color: "white",
                borderRadius: 12, padding: "14px",
                fontSize: 15, fontWeight: 600, textDecoration: "none",
              }}>
                + New project
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
