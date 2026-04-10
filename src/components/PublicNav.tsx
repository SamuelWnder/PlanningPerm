"use client";

import Link from "next/link";
import { useState } from "react";

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Blog",         href: "/blog"           },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white px-4 sm:px-8 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f5f5", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] w-9 h-9 p-1.5"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span className={`block h-[2px] bg-[#0b1d28] rounded-full transition-all ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block h-[2px] bg-[#0b1d28] rounded-full transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`block h-[2px] bg-[#0b1d28] rounded-full transition-all ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <LogoIcon className="w-5 h-5 text-[#D4922A]" />
          <span className="text-[#0b1d28] text-base font-extrabold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            PlanningPerm
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={label} href={href} className="text-sm font-semibold text-[#6b7280] hover:text-[#0b1d28] transition-colors whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link href="/dashboard/projects/new" className="bg-[#D4922A] text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#b87820] transition-colors whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
          Check my property
        </Link>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden sticky top-[57px] z-40 bg-white border-t border-gray-100 px-5 py-4 flex flex-col gap-1" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={label} href={href} onClick={() => setOpen(false)}
              className="py-3 text-sm font-semibold text-[#0b1d28] border-b border-gray-50 hover:text-[#D4922A] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
