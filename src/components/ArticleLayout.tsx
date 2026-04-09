import Link from "next/link";
import PublicNav from "@/components/PublicNav";

interface RelatedArticle {
  title: string;
  href: string;
  readTime: string;
}

interface ArticleLayoutProps {
  title: string;
  description: string;
  readTime: string;
  published: string;
  children: React.ReactNode;
  related?: RelatedArticle[];
}

export default function ArticleLayout({
  title,
  description,
  readTime,
  published,
  children,
  related = [],
}: ArticleLayoutProps) {
  return (
    <div style={{ fontFamily: "'Euclid Circular B', 'Helvetica Neue', Arial, sans-serif", background: "#eaf5f5", minHeight: "100vh" }}>

      <PublicNav />

      {/* Header */}
      <div style={{ background: "#0e1e30", paddingTop: 68 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 32px 44px" }}>
          <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontSize: 14, textDecoration: "none", marginBottom: 24 }}>
            ← Planning guides
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span style={{ background: "rgba(212,146,42,0.18)", color: "#D4922A", borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Planning guide</span>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{readTime} read · {published}</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 400, color: "white", margin: 0, lineHeight: 1.15, fontFamily: "'Clash Display', sans-serif", maxWidth: 680 }}>
            {title}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 16, fontSize: 17, lineHeight: 1.6, maxWidth: 600 }}>{description}</p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 32px 80px", display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>

        {/* CTA banner */}
        <div style={{ background: "#0e1e30", borderRadius: 16, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <p style={{ color: "white", fontWeight: 600, fontSize: 16, margin: 0 }}>Not sure if your project needs permission?</p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: "4px 0 0 0" }}>Get a free planning score for your property in under 2 minutes.</p>
          </div>
          <Link href="/dashboard/projects/new" style={{ background: "#D4922A", color: "white", borderRadius: 99, padding: "11px 22px", fontSize: 14, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
            Check my property — free →
          </Link>
        </div>

        {/* Article body */}
        <div style={{ background: "white", borderRadius: 20, padding: "44px 48px", boxShadow: "0 2px 24px rgba(0,0,0,0.06)", lineHeight: 1.85, color: "#0b1d28", fontSize: 16 }}>
          <div className="article-body">
            {children}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ background: "white", borderRadius: 20, padding: "32px 40px", boxShadow: "0 2px 24px rgba(0,0,0,0.06)", textAlign: "center" }}>
          <p style={{ fontSize: 22, fontWeight: 400, color: "#0b1d28", margin: "0 0 8px 0", fontFamily: "'Clash Display', sans-serif" }}>Find out if your project needs planning permission</p>
          <p style={{ color: "#2d3843", margin: "0 0 24px 0", fontSize: 15 }}>Enter your postcode and we'll check your property against planning constraints — free.</p>
          <Link href="/dashboard/projects/new" style={{ display: "inline-block", background: "#D4922A", color: "white", borderRadius: 99, padding: "14px 32px", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
            Get my free planning score →
          </Link>
          <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 12 }}>No account needed · Results in under 2 minutes</p>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#2d3843", marginBottom: 14 }}>Related guides</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {related.map((r) => (
                <Link key={r.href} href={r.href} style={{ background: "white", borderRadius: 14, padding: "18px 20px", textDecoration: "none", display: "block", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                  <p style={{ color: "#0b1d28", fontWeight: 500, fontSize: 15, margin: "0 0 6px 0", lineHeight: 1.4 }}>{r.title}</p>
                  <p style={{ color: "#D4922A", fontSize: 13, margin: 0 }}>{r.readTime} read →</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .article-body h2 { font-size: 22px; font-weight: 600; color: #0b1d28; margin: 36px 0 14px; font-family: 'Clash Display', sans-serif; line-height: 1.3; }
        .article-body h3 { font-size: 17px; font-weight: 600; color: #0b1d28; margin: 28px 0 10px; }
        .article-body p { margin: 0 0 18px; color: #2d3843; }
        .article-body ul, .article-body ol { margin: 0 0 18px 0; padding-left: 22px; color: #2d3843; }
        .article-body li { margin-bottom: 8px; }
        .article-body strong { color: #0b1d28; }
        .article-body .answer-box { background: #eaf5f5; border-left: 4px solid rgb(55,176,170); border-radius: 0 12px 12px 0; padding: 18px 22px; margin: 0 0 28px; }
        .article-body .answer-box p { margin: 0; color: #0b1d28; font-weight: 500; }
        .article-body .warning-box { background: rgba(212,146,42,0.08); border: 1.5px solid rgba(212,146,42,0.25); border-radius: 12px; padding: 16px 20px; margin: 0 0 28px; }
        .article-body .warning-box p { margin: 0; color: #0b1d28; }
        .article-body table { width: 100%; border-collapse: collapse; margin: 0 0 28px; font-size: 15px; }
        .article-body th { background: #eaf5f5; padding: 10px 14px; text-align: left; font-weight: 600; color: #0b1d28; border-bottom: 2px solid #d0e8e8; }
        .article-body td { padding: 10px 14px; border-bottom: 1px solid #eaf5f5; color: #2d3843; }
        .article-body tr:last-child td { border-bottom: none; }
      `}</style>
    </div>
  );
}
