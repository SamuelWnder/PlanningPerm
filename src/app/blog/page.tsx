import Link from "next/link";
import type { Metadata } from "next";
import PublicNav from "@/components/PublicNav";
import BlogList from "@/components/BlogList";

export const metadata: Metadata = {
  title: "Planning Permission Guides for UK Homeowners — PlanningPerm",
  description: "Free guides on planning permission rules in the UK. Find out what needs permission, how much it costs, and how to get approval for your project.",
};

const articles = [
  {
    slug: "do-you-need-planning-permission-for-an-extension",
    title: "Do you need planning permission for an extension?",
    description: "Most single-storey rear extensions are permitted development — but size limits, the prior approval scheme, and conservation area rules are all easy to get wrong.",
    readTime: "7 min",
    category: "Extensions",
  },
  {
    slug: "do-you-need-planning-permission-for-a-loft-conversion",
    title: "Do you need planning permission for a loft conversion?",
    description: "Most loft conversions are permitted development — but volume limits, front dormer rules, and Building Regulations requirements mean it's not always straightforward.",
    readTime: "8 min",
    category: "Loft Conversions",
  },
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
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafa", minHeight: "100vh" }}>

      <PublicNav />

      {/* Header */}
      <div style={{ background: "#0e1e30", paddingTop: 68 }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8" style={{ paddingTop: 56, paddingBottom: 48 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontSize: 14, textDecoration: "none", marginBottom: 24 }}>
            ← Back to PlanningPerm
          </Link>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: "white", margin: 0, lineHeight: 1.1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Planning Permission Guides
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 14, fontSize: 17, maxWidth: 540 }}>
            Plain-English guides on planning rules in England and Wales — written for homeowners, not planners.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8" style={{ paddingTop: 40, paddingBottom: 80 }}>

        {/* CTA strip */}
        <div style={{ background: "#0e1e30", borderRadius: 16, padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 32 }}>
          <p style={{ color: "white", fontSize: 15, margin: 0 }}>Not sure about your specific project? <span style={{ color: "rgba(255,255,255,0.55)" }}>Get a free score in 2 minutes.</span></p>
          <Link href="/dashboard/projects/new" style={{ background: "#D4922A", color: "white", borderRadius: 99, padding: "10px 20px", fontSize: 14, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
            Check my property — free →
          </Link>
        </div>

        <BlogList articles={articles} />
      </div>
    </div>
  );
}
