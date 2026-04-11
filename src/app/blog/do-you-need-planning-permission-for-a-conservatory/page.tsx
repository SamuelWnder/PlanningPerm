import type { Metadata } from "next";
import ArticleLayout from "@/components/ArticleLayout";

const SLUG = "do-you-need-planning-permission-for-a-conservatory";
const TITLE = "Do You Need Planning Permission for a Conservatory? (2026)";
const DESC = "Most conservatories don't need planning permission — but size, roof height, and location all matter. Find out the exact permitted development rules and when you do need to apply.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    "do you need planning permission for a conservatory",
    "does a conservatory need planning permission",
    "conservatory planning permission",
    "do i need planning permission for a conservatory",
    "planning permission for conservatory",
    "conservatory permitted development",
    "conservatory building regulations",
    "conservatory planning rules UK",
  ],
  authors: [{ name: "PlanningPerm", url: "https://planningperm.com" }],
  alternates: { canonical: `https://planningperm.com/blog/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESC,
    type: "article",
    url: `https://planningperm.com/blog/${SLUG}`,
    publishedTime: "2026-04-01T00:00:00Z",
    authors: ["PlanningPerm"],
    tags: ["planning permission", "conservatory", "permitted development", "UK housing"],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const related = [
  { title: "Do you need planning permission for an extension?", href: "/blog/do-you-need-planning-permission-for-an-extension", readTime: "7 min" },
  { title: "Do you need planning permission for a loft conversion?", href: "/blog/do-you-need-planning-permission-for-a-loft-conversion", readTime: "8 min" },
  { title: "How much does planning permission cost?", href: "/blog/how-much-does-planning-permission-cost-uk", readTime: "7 min" },
];

const faq = [
  { question: "Do I need planning permission for a conservatory in England?", answer: "Most conservatories in England do not need planning permission if they meet permitted development size limits: no more than 8m beyond the rear wall of a detached home (6m for semi-detached or terraced), maximum height of 4m, and covering no more than 50% of garden land. However, if your home is listed, in a conservation area, or an Article 4 direction applies, you will likely need permission." },
  { question: "What size conservatory can I build without planning permission?", answer: "Under permitted development in England, a conservatory on a detached house can extend up to 8 metres beyond the original rear wall. For semi-detached or terraced houses, the limit is 6 metres. The maximum height is 4 metres, or 3 metres at the eaves if within 2 metres of a boundary. Extensions between 4–8m (detached) or 3–6m (semi/terrace) require prior approval under the Neighbour Consultation Scheme." },
  { question: "Do I need planning permission for a conservatory in a conservation area?", answer: "If your property is in a conservation area, permitted development rights are more restricted. Side extensions are generally not permitted under PD in conservation areas, and your local planning authority will need to approve the design and materials. You should check with your council or use a planning checker tool before proceeding." },
  { question: "Does a conservatory need Building Regulations approval?", answer: "Most conservatories are exempt from Building Regulations if they are at ground level, under 30m² in floor area, separated from the main house by a wall or door, and have an independent heating system. If the conservatory is fully integrated with no separating wall or is over 30m², Building Regulations approval will be required." },
];

export default function ConservatoryArticle() {
  return (
    <ArticleLayout
      title="Do you need planning permission for a conservatory?"
      description="Most conservatories fall under permitted development, but size, location, and conservation area rules all affect whether you need permission. Here's what the rules actually say."
      readTime="6 min"
      published="April 2026"
      slug={SLUG}
      datePublished="2026-04-01"
      related={related}
      faq={faq}
    >
      <div className="answer-box">
        <p><strong>Short answer:</strong> Most conservatories in England do <em>not</em> need planning permission, as long as they meet the permitted development size and height limits. However, if your home is listed, in a conservation area, or has already had extensions, you may need to apply.</p>
      </div>

      <h2>What is permitted development?</h2>
      <p>Permitted development (PD) rights allow homeowners to carry out certain building works without applying for planning permission. They exist to reduce the burden on planning authorities for minor, low-impact projects. Conservatories commonly qualify — but only if they stay within strict limits.</p>

      <h2>The permitted development rules for conservatories</h2>
      <p>In England, a conservatory is treated as a single-storey rear extension for planning purposes. To avoid needing permission, it must meet all of the following criteria:</p>

      <h3>Size limits</h3>
      <ul>
        <li><strong>Detached homes:</strong> The conservatory must not extend beyond the rear wall of the original house by more than 8 metres.</li>
        <li><strong>Semi-detached and terraced homes:</strong> The limit is 6 metres beyond the rear wall.</li>
        <li>The total footprint of all extensions (including the conservatory) must not exceed 50% of the land around the original house.</li>
      </ul>

      <h3>Height limits</h3>
      <ul>
        <li>Maximum height: 4 metres.</li>
        <li>If within 2 metres of a boundary, the eaves height must not exceed 3 metres.</li>
      </ul>

      <h3>Other conditions</h3>
      <ul>
        <li>It must not extend beyond a wall forming a side elevation of the original house if it would be within 2 metres of the boundary.</li>
        <li>It must not be built forward of the principal elevation (front of the house).</li>
        <li>It must not include raised platforms, balconies, or verandahs.</li>
      </ul>

      <div className="warning-box">
        <p>⚠️ <strong>The Neighbour Consultation Scheme:</strong> For extensions over 4m (detached) or 3m (semi/terrace) and up to the maximum limits above, you must notify your local planning authority through the prior approval process before building. This isn't a full planning application, but you must get confirmation before starting work.</p>
      </div>

      <h2>When do you need planning permission for a conservatory?</h2>

      <h3>Listed buildings</h3>
      <p>If your home is a listed building, you will need listed building consent for any external alteration, including a conservatory — regardless of size. You will likely also need full planning permission. The design and materials will be scrutinised carefully.</p>

      <h3>Conservation areas and designated land</h3>
      <p>If your property is in a conservation area, World Heritage Site, National Park, Area of Outstanding Natural Beauty (AONB), or the Norfolk/Suffolk Broads, permitted development rights are more restricted. Side extensions are generally not permitted under PD in these areas, and any extension must be approved by your local authority.</p>

      <h3>Article 4 directions</h3>
      <p>Some councils issue Article 4 directions that remove permitted development rights from an area. This is common in conservation areas. Check with your local planning authority or use a tool like PlanningPerm to see if an Article 4 direction affects your property.</p>

      <h3>Flats and maisonettes</h3>
      <p>Permitted development rights for extensions do not apply to flats, maisonettes, or most converted properties. If your home is not a house, you will need planning permission.</p>

      <h3>Previous extensions</h3>
      <p>If previous owners have already extended the property, the cumulative size of all extensions counts towards your permitted development allowance. A conservatory that would push you over the limit will require full planning permission.</p>

      <h2>Does a conservatory need Building Regulations approval?</h2>
      <p>Planning permission and Building Regulations are separate. Most conservatories are exempt from Building Regulations if they:</p>
      <ul>
        <li>Are at ground level and under 30m² in floor area.</li>
        <li>Are separated from the main house by a wall, door, or window.</li>
        <li>Have an independent heating system (not connected to the main house heating).</li>
        <li>Are built with a glazed or translucent roof.</li>
      </ul>
      <p>If your conservatory is to be fully integrated into the house — for example, with no separating wall — then Building Regulations approval will be required to ensure thermal performance and structural safety.</p>

      <h2>What happens if you build without permission?</h2>
      <p>If you build a conservatory without the required planning permission, the council can issue an enforcement notice requiring you to remove or alter the structure. This can also cause serious complications when you come to sell the property, as buyers' solicitors will ask for evidence of planning compliance.</p>
      <p>If you are unsure, it is always safer to apply for a Lawful Development Certificate (LDC) — a formal confirmation from the council that your project is lawful under permitted development. This costs around £103 in England and provides legal protection.</p>

      <h2>How to check for your specific property</h2>
      <p>The rules above are the national defaults, but your specific situation depends on your property type, location, and planning history. The quickest way to check is to enter your postcode into PlanningPerm — we'll run automated checks against conservation area boundaries, Article 4 directions, listed building status, and your council's local planning policies.</p>

      <h2>Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Situation</th>
            <th>Planning permission needed?</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Standard house, within PD size limits</td><td>No</td></tr>
          <tr><td>Exceeds size limits</td><td>Yes</td></tr>
          <tr><td>Listed building</td><td>Yes (listed building consent + likely planning)</td></tr>
          <tr><td>Conservation area</td><td>Possibly — check with LPA</td></tr>
          <tr><td>Article 4 direction applies</td><td>Yes</td></tr>
          <tr><td>Flat or maisonette</td><td>Yes</td></tr>
          <tr><td>Between 4m–8m depth (detached)</td><td>Prior approval required</td></tr>
        </tbody>
      </table>
    </ArticleLayout>
  );
}
