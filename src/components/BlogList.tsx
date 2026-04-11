"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Article = {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  category: string;
};

export default function BlogList({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(articles.map((a) => a.category)))],
    [articles]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return articles.filter((a) => {
      const matchesCategory = activeCategory === "All" || a.category === activeCategory;
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [articles, query, activeCategory]);

  return (
    <div>
      {/* Search + filters bar */}
      <div style={{ marginBottom: 28 }}>
        {/* Search input */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search guides…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 16px 11px 40px",
              borderRadius: 12,
              border: "1.5px solid #e5e7eb",
              background: "white",
              fontSize: 15,
              color: "#0b1d28",
              outline: "none",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#D4922A"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#9ca3af",
                fontSize: 18, lineHeight: 1, padding: 0,
              }}
              aria-label="Clear search"
            >×</button>
          )}
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                border: activeCategory === cat ? "1.5px solid #D4922A" : "1.5px solid #e5e7eb",
                background: activeCategory === cat ? "rgba(212,146,42,0.1)" : "white",
                color: activeCategory === cat ? "#D4922A" : "#6b7280",
                fontSize: 13,
                fontWeight: activeCategory === cat ? 600 : 400,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.12s",
              }}
            >
              {cat}
            </button>
          ))}

          {/* Result count */}
          <span style={{
            marginLeft: "auto", alignSelf: "center",
            fontSize: 13, color: "#9ca3af",
          }}>
            {filtered.length} {filtered.length === 1 ? "guide" : "guides"}
          </span>
        </div>
      </div>

      {/* Article grid */}
      {filtered.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 500px), 1fr))", gap: 24 }}>
          {filtered.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              style={{
                background: "white", borderRadius: 20, padding: "28px 32px",
                textDecoration: "none", display: "block",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                transition: "box-shadow 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 28px rgba(0,0,0,0.11)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ background: "rgba(212,146,42,0.1)", color: "#D4922A", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {a.category}
                </span>
                <span style={{ color: "#9ca3af", fontSize: 13 }}>{a.readTime} read</span>
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0b1d28", margin: "0 0 10px", lineHeight: 1.35, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {a.title}
              </h2>
              <p style={{ color: "#2d3843", fontSize: 15, margin: "0 0 16px", lineHeight: 1.65 }}>
                {a.description}
              </p>
              <span style={{ color: "#D4922A", fontSize: 14, fontWeight: 600 }}>Read guide →</span>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <p style={{ fontSize: 16, margin: 0 }}>No guides match <strong style={{ color: "#6b7280" }}>&ldquo;{query}&rdquo;</strong></p>
          <button
            onClick={() => { setQuery(""); setActiveCategory("All"); }}
            style={{ marginTop: 16, background: "none", border: "none", color: "#D4922A", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
