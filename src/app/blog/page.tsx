import Link from "next/link";
import type { Metadata } from "next";
import PublicNav from "@/components/PublicNav";

export const metadata: Metadata = {
  title: "Planning Permission Guides for UK Homeowners — PlanningPerm",
  description: "Free guides on planning permission rules in the UK. Find out what needs permission, how much it costs, and how to get approval for your project.",
};

const articles = [
  {
    slug: "do-you-need-planning-permission-for-a-conservatory",
    title: "Do you need planning permission for a conservatory?",
    description: "Most conservatories fall under permitted development, but size, location, and conservation area rules all affect whether you need permission. Here's what the rules actually say.",
    readTime: "6 min",
    category: "Extensions",
  },
  {
    slug: "how-much-does-planning-permission-cost-uk",
    title: "How much does planning permission cost in the UK?",
    description: "From council fees to architect costs and consultant fees, here's a complete breakdown of what planning permission actually costs in England and Wales.",
    readTime: "7 min",
    category: "Costs",
  },
  {
    slug: "do-you-need-planning-permission-for-solar-panels",
    title: "Do you need planning permission for solar panels?",
    description: "Solar panels on most homes don't need planning permission. But there are important exceptions — especially for listed buildings, flat roofs, and conservation areas.",
    readTime: "5 min",
    category: "Permitted Development",
  },
  {
    slug: "do-you-need-planning-permission-for-a-pergola",
    title: "Do you need planning permission for a pergola?",
    description: "Pergolas often fall under permitted development, but the rules on height, size, and proximity to boundaries are easy to get wrong. Find out exactly what applies.",
    readTime: "5 min",
    category: "Garden Structures",
  },
];

export default function BlogPage() {
  return (
    <div style={{ fontFamily: "'Euclid Circular B', 'Helvetica Neue', Arial, sans-serif", background: "#eaf5f5", minHeight: "100vh" }}>

      <PublicNav />

      {/* Header */}
      <div style={{ background: "#0e1e30", paddingTop: 68 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 32px 48px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontSize: 14, textDecoration: "none", marginBottom: 24 }}>
            ← Back to PlanningPerm
          </Link>
          <h1 style={{ fontSize: 44, fontWeight: 400, color: "white", margin: 0, lineHeight: 1.1, fontFamily: "'Clash Display', sans-serif" }}>
            Planning Permission Guides
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 14, fontSize: 17, maxWidth: 540 }}>
            Plain-English guides on planning rules in England and Wales — written for homeowners, not planners.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 32px 80px" }}>

        {/* CTA strip */}
        <div style={{ background: "#0e1e30", borderRadius: 16, padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 32 }}>
          <p style={{ color: "white", fontSize: 15, margin: 0 }}>Not sure about your specific project? <span style={{ color: "rgba(255,255,255,0.55)" }}>Get a free score in 2 minutes.</span></p>
          <Link href="/dashboard/projects/new" style={{ background: "#D4922A", color: "white", borderRadius: 99, padding: "10px 20px", fontSize: 14, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
            Check my property — free →
          </Link>
        </div>

        {/* Article grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: 20 }}>
          {articles.map((a) => (
            <Link key={a.slug} href={`/blog/${a.slug}`} style={{ background: "white", borderRadius: 20, padding: "28px 32px", textDecoration: "none", display: "block", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", transition: "box-shadow 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ background: "rgba(212,146,42,0.1)", color: "#D4922A", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{a.category}</span>
                <span style={{ color: "#9ca3af", fontSize: 13 }}>{a.readTime} read</span>
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 500, color: "#0b1d28", margin: "0 0 10px", lineHeight: 1.35, fontFamily: "'Clash Display', sans-serif" }}>{a.title}</h2>
              <p style={{ color: "#2d3843", fontSize: 15, margin: "0 0 16px", lineHeight: 1.65 }}>{a.description}</p>
              <span style={{ color: "#D4922A", fontSize: 14, fontWeight: 600 }}>Read guide →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
