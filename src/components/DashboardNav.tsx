"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Menu, LogOut } from "lucide-react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { label: "Home",      href: "/dashboard"           },
  { label: "Projects",  href: "/dashboard/projects"  },
  { label: "Documents", href: "/dashboard/documents" },
];

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export default function DashboardNav() {
  const pathname     = usePathname();
  const router       = useRouter();
  const { isMobile } = useBreakpoint();
  const [open, setOpen]   = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white flex items-center justify-between" style={{
        padding: isMobile ? "14px 16px" : "14px 32px",
        borderBottom: "1px solid #f1f5f5",
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
      }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <LogoIcon className="w-5 h-5 text-[#D4922A]" />
          <span className="text-[#0b1d28] text-base font-extrabold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            PlanningPerm
          </span>
        </Link>

        {/* Desktop nav links */}
        {!isMobile && (
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link key={label} href={href} className="no-underline whitespace-nowrap transition-all" style={{
                  padding: "7px 14px",
                  borderRadius: 99999,
                  background: active ? "rgba(212,146,42,0.10)" : "transparent",
                  color: active ? "#D4922A" : "#6b7280",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Desktop right: CTA + user */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            <Link href="/dashboard/projects/new" className="no-underline whitespace-nowrap" style={{
              background: "#D4922A", color: "white",
              borderRadius: 99999, padding: "8px 18px",
              fontSize: 13, fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
            }}>
              + New check
            </Link>
            {email && (
              <div className="flex items-center gap-2" style={{ borderLeft: "1px solid #f1f5f5", paddingLeft: 12 }}>
                <span style={{ fontSize: 13, color: "#9ca3af", fontFamily: "'Inter', sans-serif", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {email}
                </span>
                <button
                  onClick={signOut}
                  title="Sign out"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#9ca3af", display: "flex", alignItems: "center", borderRadius: 8, transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#0b1d28")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                >
                  <LogOut size={15} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#0b1d28", display: "flex", alignItems: "center" }}>
            {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        )}
      </nav>

      {/* Mobile drawer */}
      {isMobile && open && (
        <div style={{ position: "fixed", top: 57, left: 0, right: 0, bottom: 0, zIndex: 99, background: "rgba(11,29,40,0.3)" }} onClick={() => setOpen(false)}>
          <div style={{ background: "white", padding: "8px 16px 24px", borderBottom: "1px solid #f1f5f5", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }} onClick={e => e.stopPropagation()}>
            {NAV_ITEMS.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link key={label} href={href} onClick={() => setOpen(false)} style={{
                  display: "block", padding: "14px 12px",
                  borderBottom: "1px solid #f5f5f5",
                  color: active ? "#D4922A" : "#0b1d28",
                  textDecoration: "none", fontSize: 15,
                  fontWeight: active ? 700 : 500,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {label}
                </Link>
              );
            })}
            <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/dashboard/projects/new" onClick={() => setOpen(false)} style={{
                display: "block", textAlign: "center",
                background: "#D4922A", color: "white",
                borderRadius: 12, padding: "14px",
                fontSize: 15, fontWeight: 600,
                textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
              }}>
                + New check
              </Link>
              {email && (
                <button
                  onClick={() => { setOpen(false); signOut(); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "none", border: "1.5px solid #f1f5f5", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 500, color: "#6b7280", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
                >
                  <LogOut size={14} strokeWidth={2} /> Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
