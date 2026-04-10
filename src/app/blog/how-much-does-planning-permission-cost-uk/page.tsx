import type { Metadata } from "next";
import ArticleLayout from "@/components/ArticleLayout";

const SLUG = "how-much-does-planning-permission-cost-uk";
const TITLE = "How Much Does Planning Permission Cost in the UK? (2025)";
const DESC = "A full breakdown of planning permission costs in England and Wales — council fees, architect fees, planning consultant fees, and hidden costs most homeowners miss.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["planning permission cost UK", "how much does planning permission cost", "planning application fee 2025", "planning consultant fees", "architect fees planning permission", "lawful development certificate cost"],
  authors: [{ name: "PlanningPerm", url: "https://planningperm.com" }],
  alternates: { canonical: `https://planningperm.com/blog/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESC,
    type: "article",
    url: `https://planningperm.com/blog/${SLUG}`,
    publishedTime: "2025-04-01T00:00:00Z",
    authors: ["PlanningPerm"],
    tags: ["planning permission", "planning costs", "UK housing", "planning application"],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const related = [
  { title: "Planning permission for a conservatory", href: "/blog/do-you-need-planning-permission-for-a-conservatory", readTime: "6 min" },
  { title: "Planning permission for solar panels", href: "/blog/do-you-need-planning-permission-for-solar-panels", readTime: "5 min" },
  { title: "Planning permission for a pergola", href: "/blog/do-you-need-planning-permission-for-a-pergola", readTime: "5 min" },
];

const faq = [
  { question: "How much does planning permission cost in England in 2025?", answer: "For a householder planning application in England (extensions, loft conversions, outbuildings), the council fee is £258. A Lawful Development Certificate (LDC) costs £103. These are government-set fees. On top of this, you may need to pay for architect drawings (£500–£2,000), a planning consultant (£500–£3,000+), and a planning statement or design & access statement." },
  { question: "Do I need to pay for a planning application if I'm just checking?", answer: "No. You only pay the council fee when you formally submit a planning application. You can get a pre-application assessment from your council (usually £50–£300) or use a tool like PlanningPerm to check your approval odds for free before committing to an application." },
  { question: "What is a Lawful Development Certificate and how much does it cost?", answer: "A Lawful Development Certificate (LDC) is formal confirmation from your council that your project is lawful under permitted development rights. It costs £103 in England and provides legal protection if you sell the property. It's not required, but many homeowners get one for peace of mind." },
  { question: "Can I get planning permission for free?", answer: "The council application fee is mandatory and cannot be waived for most applications. However, you can reduce total costs by using permitted development rights (no application needed), applying for a Lawful Development Certificate (£103 vs £258), or using AI tools like PlanningPerm to avoid paying a planning consultant for straightforward projects." },
];

export default function CostArticle() {
  return (
    <ArticleLayout
      title="How much does planning permission cost in the UK?"
      description="From council fees to architect costs and consultant fees, here's a complete breakdown of what planning permission actually costs in England and Wales in 2025."
      readTime="7 min"
      published="April 2025"
      slug={SLUG}
      datePublished="2025-04-01"
      related={related}
      faq={faq}
    >
      <div className="answer-box">
        <p><strong>Short answer:</strong> The council fee for a typical householder application in England is <strong>£528</strong> (from December 2024). On top of that, most homeowners spend £1,500–£3,500 on architect drawings and £0–£2,000 on a planning consultant. Total cost to permission: typically <strong>£2,000–£5,000</strong> for a standard extension.</p>
      </div>

      <h2>The council application fee</h2>
      <p>The fee you pay to your local planning authority (LPA) for a householder application — the most common type for home extensions, loft conversions, and outbuildings — was increased in December 2024.</p>

      <table>
        <thead>
          <tr>
            <th>Application type</th>
            <th>Fee (England, from Dec 2024)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Householder application (extensions, loft conversions, outbuildings)</td><td>£528</td></tr>
          <tr><td>New dwelling (single house)</td><td>£578</td></tr>
          <tr><td>New dwelling (2–50 units)</td><td>£578 per unit</td></tr>
          <tr><td>Change of use (e.g. garage to habitable space)</td><td>£578</td></tr>
          <tr><td>Prior approval (larger home extension)</td><td>£120</td></tr>
          <tr><td>Lawful Development Certificate (LDC)</td><td>£103 (proposed) / £258 (existing)</td></tr>
          <tr><td>Listed building consent</td><td>Free</td></tr>
        </tbody>
      </table>

      <p>In Wales, the fee for a householder application is £230. Scotland and Northern Ireland operate separate systems with different fee structures.</p>

      <div className="warning-box">
        <p>⚠️ <strong>Fee increases are ongoing:</strong> The government announced a further 25% increase to planning fees for major applications in 2024. Householder fees are likely to rise again. Check the Planning Portal for the latest figures before applying.</p>
      </div>

      <h2>Architect and drawing fees</h2>
      <p>Unless you're very experienced, you will almost certainly need professional drawings for a planning application. Most LPAs require scaled site plans, floor plans, and elevation drawings to be submitted. Costs vary significantly:</p>

      <table>
        <thead>
          <tr>
            <th>Project type</th>
            <th>Typical architect / drawing fee</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Single-storey rear extension</td><td>£800–£1,800</td></tr>
          <tr><td>Double-storey extension</td><td>£1,500–£3,500</td></tr>
          <tr><td>Loft conversion</td><td>£1,200–£2,500</td></tr>
          <tr><td>New build (single house)</td><td>£5,000–£15,000+</td></tr>
          <tr><td>Outbuilding / garden room</td><td>£500–£1,200</td></tr>
        </tbody>
      </table>

      <p>Note that architect fees for planning drawings are usually a fraction of the total architect fee if you also want them to manage the build. Many homeowners use architectural technicians or planning drawing services rather than full architects for simple extensions — this can halve the cost.</p>

      <h2>Planning consultant fees</h2>
      <p>For straightforward householder applications, you don't necessarily need a planning consultant. However, for complex or sensitive sites — conservation areas, listed buildings, greenfield land, or applications that have previously been refused — a consultant can significantly improve your chances.</p>
      <ul>
        <li>Hourly rates: <strong>£80–£180/hour</strong></li>
        <li>Fixed fee for managing a householder application: <strong>£500–£2,000</strong></li>
        <li>Complex or major applications: <strong>£2,000–£10,000+</strong></li>
      </ul>

      <h2>Pre-application advice fees</h2>
      <p>Many councils offer a pre-application advice service where you can discuss your proposal with a planning officer before submitting a formal application. This can be valuable for complex projects. Costs vary widely by council:</p>
      <ul>
        <li>Simple householder enquiry: <strong>£50–£300</strong></li>
        <li>Complex residential development: <strong>£300–£1,500</strong></li>
        <li>Some smaller councils offer free pre-application advice for householder applications.</li>
      </ul>

      <h2>Supporting documents and reports</h2>
      <p>Depending on your site, the LPA may require additional supporting documents alongside the application. These can add significant cost:</p>

      <table>
        <thead>
          <tr>
            <th>Document</th>
            <th>Typical cost</th>
            <th>When required</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Design &amp; Access Statement</td><td>£200–£600 (or included with architect)</td><td>Most applications over a certain size</td></tr>
          <tr><td>Heritage statement</td><td>£500–£2,000</td><td>Listed buildings, conservation areas</td></tr>
          <tr><td>Flood risk assessment</td><td>£300–£1,500</td><td>Sites in flood zones 2 or 3</td></tr>
          <tr><td>Bat / ecology survey</td><td>£300–£1,500</td><td>Demolition or work near mature trees</td></tr>
          <tr><td>Tree survey (Arboricultural report)</td><td>£200–£800</td><td>If there are trees on or near the site</td></tr>
          <tr><td>Structural survey</td><td>£500–£1,000</td><td>Listed buildings, basement work</td></tr>
        </tbody>
      </table>

      <h2>What happens if your application is refused?</h2>
      <p>If your application is refused and you want to appeal, there is no fee for a planning appeal in England (appeals are heard by the Planning Inspectorate). However, you may need to pay your planning consultant or solicitor to prepare and submit the appeal, which can cost £1,000–£5,000 depending on complexity.</p>
      <p>You can also resubmit an amended application within 12 months of a refusal at no extra fee — this is often the most practical route for straightforward cases.</p>

      <h2>How to reduce planning costs</h2>
      <ul>
        <li><strong>Check permitted development first.</strong> Many projects don't need planning permission at all. Before spending anything, confirm whether your project qualifies under permitted development rights.</li>
        <li><strong>Use a planning drawing service rather than a full architect</strong> for simple extensions. Many offer fixed-price packages from £400–£800.</li>
        <li><strong>Use AI-drafted planning documents.</strong> PlanningPerm generates a Design &amp; Access Statement, Planning Statement, and Cover Letter for £20 — documents that would typically cost £200–£600 from a consultant.</li>
        <li><strong>Take advantage of pre-application advice</strong> from your council before paying for full drawings and a formal submission.</li>
        <li><strong>Check whether an LDC is sufficient.</strong> For projects that clearly meet PD rules, a Lawful Development Certificate (£103) gives you formal confirmation without a full planning application.</li>
      </ul>

      <h2>Total cost summary</h2>
      <table>
        <thead>
          <tr>
            <th>Cost item</th>
            <th>Typical range</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Council application fee</td><td>£528</td></tr>
          <tr><td>Architect / drawings</td><td>£800–£3,500</td></tr>
          <tr><td>Planning consultant (optional)</td><td>£0–£2,000</td></tr>
          <tr><td>Supporting documents (if needed)</td><td>£0–£3,000</td></tr>
          <tr><td>Pre-application advice (optional)</td><td>£0–£300</td></tr>
          <tr><td><strong>Typical total (standard extension)</strong></td><td><strong>£1,500–£5,000</strong></td></tr>
        </tbody>
      </table>
    </ArticleLayout>
  );
}
