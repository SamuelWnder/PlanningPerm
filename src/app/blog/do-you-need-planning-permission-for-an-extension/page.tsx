import type { Metadata } from "next";
import ArticleLayout from "@/components/ArticleLayout";

const SLUG = "do-you-need-planning-permission-for-an-extension";
const TITLE = "Do You Need Planning Permission for an Extension? (2026)";
const DESC = "Most single-storey rear extensions are permitted development — but size, position, and conservation area rules all affect whether you need to apply. Here's the complete 2026 guide.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    "do you need planning permission for an extension",
    "house extension planning permission",
    "extension permitted development",
    "do i need planning permission for an extension",
    "planning permission for house extension",
    "single storey extension planning permission",
    "extension building regulations uk",
    "rear extension permitted development rules",
  ],
  authors: [{ name: "PlanningPerm", url: "https://planningperm.com" }],
  alternates: { canonical: `https://planningperm.com/blog/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESC,
    type: "article",
    url: `https://planningperm.com/blog/${SLUG}`,
    publishedTime: "2026-04-06T00:00:00Z",
    authors: ["PlanningPerm"],
    tags: ["house extension", "planning permission", "permitted development", "UK housing"],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const related = [
  { title: "Do you need planning permission for a loft conversion?", href: "/blog/do-you-need-planning-permission-for-a-loft-conversion", readTime: "8 min" },
  { title: "Planning permission for a conservatory", href: "/blog/do-you-need-planning-permission-for-a-conservatory", readTime: "6 min" },
  { title: "How much does planning permission cost?", href: "/blog/how-much-does-planning-permission-cost-uk", readTime: "7 min" },
];

const faq = [
  {
    question: "Do I need planning permission for a rear extension?",
    answer: "Most single-storey rear extensions do not need planning permission under permitted development rights. A detached house can extend up to 4 metres beyond the rear wall (or up to 8 metres with prior approval under the Neighbour Consultation Scheme). Semi-detached and terraced houses can extend up to 3 metres (or 6 metres with prior approval). The extension must not exceed 4 metres in height and must cover no more than 50% of the original garden.",
  },
  {
    question: "How far can I extend without planning permission?",
    answer: "Under permitted development, a single-storey rear extension on a detached house can be up to 4 metres deep without any notification. Between 4 and 8 metres, you need prior approval through the Neighbour Consultation Scheme (not a full planning application, but your council must confirm before you build). For semi-detached or terraced houses the thresholds are 3 metres and 6 metres respectively. Two-storey rear extensions are limited to 3 metres under permitted development.",
  },
  {
    question: "Do I need planning permission for a side extension?",
    answer: "Single-storey side extensions are permitted development if they are no more than half the width of the original house, no higher than 4 metres, and set back at least 0.5 metres from any boundary. However, in conservation areas, side extensions that would be visible from a highway require planning permission even if they would otherwise be PD. Two-storey side extensions always require full planning permission.",
  },
  {
    question: "Do house extensions need Building Regulations approval?",
    answer: "Yes — all house extensions require Building Regulations approval, regardless of whether planning permission is needed. Building Regulations cover the structural integrity of the new build, thermal insulation, drainage, fire safety, and electrical work. You must notify your local authority Building Control or an approved inspector before starting work.",
  },
  {
    question: "Can I extend my house in a conservation area without planning permission?",
    answer: "In conservation areas, permitted development rights for extensions are more restricted. Any extension to the side of the house visible from a highway requires planning permission. Rear extensions may still be permitted development, but the council will usually have design guidance on materials and appearance. Always check with your local planning authority before proceeding.",
  },
];

export default function ExtensionArticle() {
  return (
    <ArticleLayout
      title="Do you need planning permission for an extension?"
      description="Most single-storey rear extensions are permitted development — but the size limits, prior approval thresholds, and conservation area rules are all easy to get wrong. Here's exactly what the rules say."
      readTime="7 min"
      published="April 2026"
      slug={SLUG}
      datePublished="2026-04-06"
      related={related}
      faq={faq}
    >
      <div className="answer-box">
        <p><strong>Short answer:</strong> Most single-storey rear extensions in England do <em>not</em> need planning permission under permitted development rights — but size limits, the prior approval scheme, and restrictions in conservation areas all affect whether you can build freely. Building Regulations approval is required for all extensions.</p>
      </div>

      <h2>What is permitted development for extensions?</h2>
      <p>Permitted development (PD) rights let homeowners carry out certain building works without a full planning application. For house extensions, these rights are set out in Class A of Schedule 2 to the Town and Country Planning (General Permitted Development) (England) Order 2015. The rules differ depending on whether the extension is at the rear, side, or front of the house, and whether it is single-storey or two-storey.</p>

      <h2>Single-storey rear extensions</h2>
      <p>Single-storey rear extensions have the most generous permitted development allowances. To qualify:</p>

      <h3>Depth limits</h3>
      <ul>
        <li><strong>Detached houses:</strong> Up to 4 metres beyond the rear wall of the original house.</li>
        <li><strong>Semi-detached and terraced houses:</strong> Up to 3 metres beyond the rear wall.</li>
      </ul>

      <h3>The Neighbour Consultation Scheme (prior approval)</h3>
      <p>For extensions between the standard limit and a higher threshold, you can still avoid full planning permission — but you must get prior approval through the Neighbour Consultation Scheme before building:</p>
      <ul>
        <li><strong>Detached houses:</strong> Extensions between 4 and 8 metres require prior approval.</li>
        <li><strong>Semi-detached and terraced houses:</strong> Extensions between 3 and 6 metres require prior approval.</li>
      </ul>
      <p>Prior approval is not a full planning application — you submit a simple form, your neighbours are notified, and the council has 42 days to either approve or object. If no objection is raised, you can proceed. This is much faster and cheaper than a full planning application.</p>

      <div className="warning-box">
        <p>⚠️ <strong>Do not confuse prior approval with full planning permission.</strong> You must still submit a prior approval application and receive a decision before starting work. Building without it means the extension is technically unauthorised, even if it would have been approved.</p>
      </div>

      <h3>Height limits</h3>
      <ul>
        <li>Maximum height: <strong>4 metres</strong>.</li>
        <li>If the extension is within 2 metres of a property boundary, the maximum eaves height is <strong>3 metres</strong>.</li>
        <li>The extension must not be taller than the highest part of the existing roof.</li>
      </ul>

      <h3>Coverage limit</h3>
      <p>The total area of all extensions and outbuildings must not cover more than <strong>50% of the land around the original house</strong>. Only the original curtilage counts — any land added later (such as a purchased strip of garden from a neighbour) is included, but the measurement starts from the original building footprint.</p>

      <h2>Two-storey rear extensions</h2>
      <p>Two-storey rear extensions have stricter limits under permitted development:</p>
      <ul>
        <li>Maximum depth: <strong>3 metres</strong> beyond the rear wall.</li>
        <li>The extension must be at least <strong>7 metres from the rear boundary</strong>.</li>
        <li>The roof pitch must match the existing house as closely as possible.</li>
        <li>No balconies, verandas, or raised platforms are permitted.</li>
        <li>Windows in a wall or roof slope that faces a side boundary must be obscure-glazed if within 2 metres of the boundary.</li>
      </ul>
      <p>There is no prior approval / Neighbour Consultation Scheme for two-storey extensions — they are either within the 3-metre permitted development limit or they require full planning permission.</p>

      <h2>Side extensions</h2>
      <p>Single-storey side extensions are permitted development if:</p>
      <ul>
        <li>The width is no more than <strong>half the width of the original house</strong>.</li>
        <li>The maximum height is <strong>4 metres</strong>.</li>
        <li>The extension is set back at least <strong>0.5 metres from the highway</strong> boundary (if applicable).</li>
      </ul>
      <p><strong>Two-storey side extensions always require planning permission</strong> — they are not covered by permitted development rights.</p>

      <h2>Front extensions</h2>
      <p>Any extension that projects forward of the <strong>principal elevation</strong> (the front of the house) or forward of any side elevation facing a highway requires planning permission — this is entirely excluded from permitted development. Porches are an exception: a small porch up to 3m² and under 3 metres in height is permitted development.</p>

      <h2>When do you need planning permission for an extension?</h2>

      <h3>You exceed the size limits</h3>
      <p>If your planned extension is deeper, taller, or wider than the permitted development thresholds, you will need a full planning application. This is assessed against your council's Local Plan policies, including design guidance and neighbour impact criteria.</p>

      <h3>Listed buildings</h3>
      <p>Any external alteration to a listed building requires <strong>listed building consent</strong>, regardless of size. For most extensions to listed properties, full planning permission will also be required. Materials, design, and the impact on the historic fabric of the building will all be scrutinised.</p>

      <h3>Conservation areas</h3>
      <p>In conservation areas, permitted development rights for extensions are restricted:</p>
      <ul>
        <li>Side extensions visible from a highway require planning permission.</li>
        <li>Any cladding of the exterior with stone, artificial stone, pebble dash, render, timber, plastic, or tiles requires planning permission.</li>
        <li>Rear extensions may still be permitted development, but materials and design should be sympathetic to the area.</li>
      </ul>

      <h3>Article 4 directions</h3>
      <p>Where an Article 4 direction has been made, some or all permitted development rights are removed. This is common in conservation areas and some new-build estates. If an Article 4 applies to your property, you need planning permission for works that would otherwise be PD.</p>

      <h3>Flats and maisonettes</h3>
      <p>Permitted development rights for extensions apply only to houses. Flats, maisonettes, and converted properties require planning permission for any external extension.</p>

      <h3>Properties with conditions on previous permissions</h3>
      <p>Sometimes, a planning permission granted on the original house or a previous extension includes a condition removing future permitted development rights. Check any existing planning permissions for your property before assuming PD applies.</p>

      <h2>Do extensions require Building Regulations approval?</h2>
      <p>Yes — <strong>all extensions require Building Regulations approval</strong>, regardless of whether planning permission is needed. Building Regulations are separate from planning permission and cover the technical aspects of construction:</p>
      <ul>
        <li><strong>Structure:</strong> Foundations, walls, and roof must meet structural standards.</li>
        <li><strong>Thermal insulation:</strong> The extension must meet current energy efficiency standards (Part L).</li>
        <li><strong>Drainage:</strong> Any new drainage must be connected correctly.</li>
        <li><strong>Fire safety:</strong> Escape routes and fire-resistant construction where required.</li>
        <li><strong>Electrics and gas:</strong> Any new electrical or gas work must be certified.</li>
      </ul>
      <p>You must notify your local authority Building Control or an approved inspector before starting work. On completion, you'll receive a completion certificate — you'll need this when you sell the property.</p>

      <h2>Party Wall Act</h2>
      <p>If your extension is attached to a shared wall with a neighbour (or involves excavation within 3–6 metres of their foundations), you must serve a <strong>Party Wall Notice</strong> under the Party Wall etc. Act 1996 before starting work. This is separate from planning permission and Building Regulations, and cannot be skipped.</p>

      <h2>How to check your specific situation</h2>
      <p>The rules above are England's national defaults. Whether permitted development applies to your specific property depends on your house type, local planning constraints, and existing extensions. Use PlanningPerm to run an automated check — we flag conservation areas, listed building status, Article 4 directions, and your council's local planning policies for your exact address.</p>

      <h2>Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Extension type</th>
            <th>Planning permission needed?</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Single-storey rear, within 4m (detached) / 3m (semi/terrace)</td><td>No</td></tr>
          <tr><td>Single-storey rear, 4–8m (detached) / 3–6m (semi/terrace)</td><td>Prior approval required</td></tr>
          <tr><td>Single-storey rear, over 8m (detached) / 6m (semi/terrace)</td><td>Yes</td></tr>
          <tr><td>Two-storey rear, within 3m and 7m from boundary</td><td>No</td></tr>
          <tr><td>Two-storey rear, over 3m or within 7m of boundary</td><td>Yes</td></tr>
          <tr><td>Single-storey side, within half width of house</td><td>No</td></tr>
          <tr><td>Two-storey side (any size)</td><td>Yes</td></tr>
          <tr><td>Front extension (any)</td><td>Yes</td></tr>
          <tr><td>Conservation area — side extension visible from road</td><td>Yes</td></tr>
          <tr><td>Listed building (any extension)</td><td>Yes (listed building consent)</td></tr>
          <tr><td>Flat or maisonette</td><td>Yes</td></tr>
          <tr><td>Building Regulations approval</td><td>Always required</td></tr>
        </tbody>
      </table>
    </ArticleLayout>
  );
}
