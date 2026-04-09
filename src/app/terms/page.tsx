import Link from "next/link";
import type { Metadata } from "next";
import PublicNav from "@/components/PublicNav";

export const metadata: Metadata = {
  title: "Terms & Conditions — PlanningPerm",
  description: "Terms and conditions for using the PlanningPerm platform.",
};

const LAST_UPDATED = "1 April 2026";
const EMAIL = "hello@planningperm.com";

export default function TermsPage() {
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
            Terms &amp; Conditions
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", marginTop: 12, fontSize: 15 }}>Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 32px 80px" }}>
        <div style={{ background: "white", borderRadius: 20, padding: "48px 52px", boxShadow: "0 2px 24px rgba(0,0,0,0.06)", lineHeight: 1.8, color: "#0b1d28", fontSize: 16 }}>

          <p style={{ background: "rgba(212,146,42,0.08)", border: "1.5px solid rgba(212,146,42,0.25)", borderRadius: 12, padding: "16px 20px", color: "#0b1d28", marginBottom: 36, fontSize: 15 }}>
            <strong>Important:</strong> PlanningPerm provides informational guidance only. Nothing on this platform constitutes professional planning advice. Always consult a qualified planning consultant or local planning authority before submitting a planning application.
          </p>

          <Section title="1. About these terms">
            <p>These terms and conditions ("Terms") govern your use of the PlanningPerm platform operated by DueReady, a company registered in England and Wales ("we", "us", "our"). PlanningPerm is a trading name of DueReady.</p>
            <p>By accessing or using PlanningPerm, you agree to these Terms. If you do not agree, do not use the service.</p>
          </Section>

          <Section title="2. The service">
            <p>PlanningPerm provides:</p>
            <ul>
              <li>An AI-powered planning feasibility assessment based on your postcode, property details, and proposed development.</li>
              <li>Automated checks against publicly available planning constraints (conservation areas, flood zones, listed buildings, Article 4 directions, green belt, AONB).</li>
              <li>AI-drafted planning documents including a Design &amp; Access Statement, Planning Statement, and Cover Letter.</li>
            </ul>
            <p>A free preview score is available without payment. Full reports and planning documents are available for a one-off fee of £20 (inclusive of VAT where applicable).</p>
          </Section>

          <Section title="3. Not professional advice">
            <p>The assessments, scores, and documents produced by PlanningPerm are generated using publicly available data and AI models. They are provided for informational purposes only and do not constitute:</p>
            <ul>
              <li>Professional planning advice</li>
              <li>Legal advice</li>
              <li>A guarantee of planning permission being granted or refused</li>
            </ul>
            <p>Planning decisions are made by local planning authorities at their sole discretion. Approval rates, constraint data, and document content may not reflect the most current information. We strongly recommend obtaining professional advice before submitting any planning application.</p>
          </Section>

          <Section title="4. Eligibility">
            <p>You must be at least 18 years old to use this service. By using PlanningPerm, you confirm you are 18 or over.</p>
          </Section>

          <Section title="5. Payments and refunds">
            <p>Paid reports are charged at £20 per report at the time of publication. Prices may change and will be displayed clearly before purchase.</p>
            <p>Payments are processed by Paddle. We do not store your card details.</p>
            <p><strong>Refund policy:</strong> You are entitled to a full refund within 30 days of purchase. To request a refund, contact us at <a href={`mailto:${EMAIL}`} style={{ color: "#D4922A" }}>{EMAIL}</a> with your order details and we will process it promptly.</p>
          </Section>

          <Section title="6. Acceptable use">
            <p>You agree not to:</p>
            <ul>
              <li>Use PlanningPerm for any unlawful purpose.</li>
              <li>Submit false or misleading information about a property or development.</li>
              <li>Attempt to reverse-engineer, scrape, or access our systems in an unauthorised manner.</li>
              <li>Resell or redistribute reports generated by the platform without our written permission.</li>
            </ul>
          </Section>

          <Section title="7. Intellectual property">
            <p>The PlanningPerm platform, including its design, code, and branding, is owned by DueReady. You may not reproduce or distribute any part of the platform without our written consent.</p>
            <p>Planning documents generated for you are provided for your personal use in connection with your specific property. You may submit them to your local planning authority as part of an application.</p>
          </Section>

          <Section title="8. Data accuracy">
            <p>We source planning constraint data from public APIs including the Planning Portal, Ordnance Survey, and Environment Agency. While we aim for accuracy, we cannot guarantee that all data is complete or up to date. You should verify constraint information with your local planning authority before relying on it.</p>
            <p>Approval probability scores are based on aggregated historical decision data. They are indicative only and should not be treated as a prediction of the outcome of any specific application.</p>
          </Section>

          <Section title="9. Limitation of liability">
            <p>To the maximum extent permitted by law, DueReady shall not be liable for:</p>
            <ul>
              <li>Any planning application being refused, delayed, or subject to conditions.</li>
              <li>Loss of profit, revenue, or business arising from use of the service.</li>
              <li>Inaccuracies in constraint data or AI-generated content.</li>
              <li>Any indirect or consequential loss of any kind.</li>
            </ul>
            <p>Our total liability to you for any claim arising from use of the service shall not exceed the amount you paid for the relevant report.</p>
          </Section>

          <Section title="10. Third-party services">
            <p>Our service relies on third-party providers including Stripe (payments), Anthropic (AI), Supabase (data storage), and public planning data APIs. We are not responsible for the availability or accuracy of third-party services.</p>
          </Section>

          <Section title="11. Changes to the service">
            <p>We reserve the right to modify, suspend, or discontinue the service at any time. We will provide reasonable notice of significant changes where possible.</p>
          </Section>

          <Section title="12. Changes to these terms">
            <p>We may update these Terms from time to time. The date at the top of this page reflects the most recent version. Your continued use of the service after changes constitutes acceptance of the updated Terms.</p>
          </Section>

          <Section title="13. Governing law">
            <p>These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </Section>

          <Section title="14. Contact">
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
