import Link from "next/link";
import type { Metadata } from "next";
import PublicNav from "@/components/PublicNav";

export const metadata: Metadata = {
  title: "Privacy Policy — PlanningPerm",
  description: "How PlanningPerm collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "1 April 2026";
const EMAIL = "hello@planningperm.com";

export default function PrivacyPage() {
  return (
    <div style={{ fontFamily: "'Euclid Circular B', 'Helvetica Neue', Arial, sans-serif", background: "#eaf5f5", minHeight: "100vh" }}>

      <PublicNav />

      {/* Header */}
      <div style={{ background: "#0e1e30", paddingTop: 68 }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "56px 32px 48px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "none", marginBottom: 28 }}>
            ← Back to PlanningPerm
          </Link>
          <h1 style={{ fontSize: 44, fontWeight: 400, color: "white", margin: 0, lineHeight: 1.1, fontFamily: "'Clash Display', sans-serif" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", marginTop: 12, fontSize: 15 }}>Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 32px 80px" }}>
        <div style={{ background: "white", borderRadius: 20, padding: "48px 52px", boxShadow: "0 2px 24px rgba(0,0,0,0.06)", lineHeight: 1.8, color: "#0b1d28", fontSize: 16 }}>

          <Section title="1. Who we are">
            <p>DueReady ("we", "us", "our") is a company registered in England and Wales. We operate PlanningPerm, available at planningperm.com. PlanningPerm is a trading name of DueReady.</p>
            <p>We are the data controller for the personal data we process. If you have any questions about this policy, contact us at <a href={`mailto:${EMAIL}`} style={{ color: "#D4922A" }}>{EMAIL}</a>.</p>
          </Section>

          <Section title="2. What data we collect">
            <p>We collect the following categories of personal data:</p>
            <ul>
              <li><strong>Contact information</strong> — your email address, provided when you request a report or create an account.</li>
              <li><strong>Property data</strong> — the postcode or address you enter when running a planning assessment.</li>
              <li><strong>Project details</strong> — information you provide about your proposed development (e.g. extension type, dimensions, materials).</li>
              <li><strong>Payment information</strong> — processed by Stripe. We do not store card details. We retain Stripe session IDs and payment status.</li>
              <li><strong>Usage data</strong> — anonymised page-view and interaction data collected via Plausible Analytics (no cookies, no personal identifiers).</li>
              <li><strong>Communications</strong> — any messages you send to us by email or contact form.</li>
            </ul>
          </Section>

          <Section title="3. How we use your data">
            <p>We use your personal data to:</p>
            <ul>
              <li>Generate your planning feasibility assessment and documents.</li>
              <li>Process and verify payment for paid reports.</li>
              <li>Send you your report and any related correspondence.</li>
              <li>Respond to support enquiries.</li>
              <li>Improve our service and identify technical issues.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </Section>

          <Section title="4. Legal basis for processing">
            <p>We process your personal data under the following lawful bases (UK GDPR Article 6):</p>
            <ul>
              <li><strong>Contract performance</strong> — processing your address and project details to deliver the assessment you requested.</li>
              <li><strong>Legitimate interests</strong> — improving our platform, preventing fraud, and ensuring service security.</li>
              <li><strong>Legal obligation</strong> — retaining transaction records as required by UK tax and financial regulations.</li>
              <li><strong>Consent</strong> — where we send optional marketing communications. You may withdraw consent at any time.</li>
            </ul>
          </Section>

          <Section title="5. Third-party services">
            <p>We share data with the following third parties to operate our service:</p>
            <ul>
              <li><strong>Supabase</strong> — cloud database provider. Stores paid project records. Data held in EU region.</li>
              <li><strong>Stripe</strong> — payment processing. Subject to Stripe's own privacy policy.</li>
              <li><strong>Anthropic</strong> — AI model provider (Claude). Property descriptions and project details are sent to generate your assessment. Anthropic does not use API data to train models.</li>
              <li><strong>Resend</strong> — transactional email delivery.</li>
              <li><strong>Plausible Analytics</strong> — privacy-friendly, cookieless analytics. No personal data is shared.</li>
              <li><strong>Planning Portal / Ordnance Survey / Environment Agency</strong> — public planning data APIs. No personal data is shared with these services.</li>
            </ul>
            <p>We do not sell your personal data to any third party.</p>
          </Section>

          <Section title="6. Data retention">
            <p>We retain your data for the following periods:</p>
            <ul>
              <li><strong>Paid project records</strong> — 7 years, to comply with HMRC requirements.</li>
              <li><strong>Email enquiries</strong> — 2 years from last contact.</li>
              <li><strong>Free assessment session data</strong> — stored only in your browser (localStorage/sessionStorage) and never transmitted to our servers. Cleared when you clear your browser data.</li>
            </ul>
          </Section>

          <Section title="7. Cookies">
            <p>We do not use tracking cookies. Our analytics provider, Plausible, is cookieless and does not collect personal identifiers. No cookie consent banner is required.</p>
          </Section>

          <Section title="8. Your rights">
            <p>Under UK GDPR, you have the following rights:</p>
            <ul>
              <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification</strong> — ask us to correct inaccurate data.</li>
              <li><strong>Erasure</strong> — ask us to delete your data (subject to legal retention requirements).</li>
              <li><strong>Restriction</strong> — ask us to restrict processing in certain circumstances.</li>
              <li><strong>Portability</strong> — receive your data in a machine-readable format.</li>
              <li><strong>Objection</strong> — object to processing based on legitimate interests.</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href={`mailto:${EMAIL}`} style={{ color: "#D4922A" }}>{EMAIL}</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="9. Complaints">
            <p>If you are unhappy with how we handle your data, you have the right to lodge a complaint with the UK Information Commissioner's Office (ICO): <a href="https://ico.org.uk" target="_blank" rel="noreferrer" style={{ color: "#D4922A" }}>ico.org.uk</a>.</p>
          </Section>

          <Section title="10. Changes to this policy">
            <p>We may update this policy from time to time. The date at the top of this page reflects the most recent version. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="11. Contact">
            <p>DueReady (trading as PlanningPerm)<br />London, England<br /><a href={`mailto:${EMAIL}`} style={{ color: "#D4922A" }}>{EMAIL}</a></p>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0b1d28", marginBottom: 14, marginTop: 0, fontFamily: "'Clash Display', sans-serif" }}>{title}</h2>
      <div style={{ color: "#2d3843" }}>{children}</div>
    </div>
  );
}
