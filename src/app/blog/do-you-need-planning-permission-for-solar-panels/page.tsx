import type { Metadata } from "next";
import ArticleLayout from "@/components/ArticleLayout";

const SLUG = "do-you-need-planning-permission-for-solar-panels";
const TITLE = "Do You Need Planning Permission for Solar Panels in the UK?";
const DESC = "Solar panels on most homes don't need planning permission, but there are important exceptions for listed buildings, flat roofs, and conservation areas. Here's the full picture.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["planning permission solar panels", "solar panels permitted development", "do I need planning permission for solar panels", "solar panels conservation area", "solar panels listed building planning"],
  authors: [{ name: "PlanningPerm", url: "https://planningperm.com" }],
  alternates: { canonical: `https://planningperm.com/blog/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESC,
    type: "article",
    url: `https://planningperm.com/blog/${SLUG}`,
    publishedTime: "2025-04-01T00:00:00Z",
    authors: ["PlanningPerm"],
    tags: ["solar panels", "planning permission", "permitted development", "renewable energy UK"],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const related = [
  { title: "Planning permission for a conservatory", href: "/blog/do-you-need-planning-permission-for-a-conservatory", readTime: "6 min" },
  { title: "How much does planning permission cost?", href: "/blog/how-much-does-planning-permission-cost-uk", readTime: "7 min" },
  { title: "Planning permission for a pergola", href: "/blog/do-you-need-planning-permission-for-a-pergola", readTime: "5 min" },
];

const faq = [
  { question: "Do I need planning permission for solar panels in England?", answer: "No, in most cases solar panels on a house roof in England do not need planning permission. They are permitted development as long as they do not protrude more than 200mm from the roof surface, are not on a listed building, and are not on a roof that faces a highway. Solar panels on the ground in your garden may also be permitted development if they are below 4m in height and not in a conservation area." },
  { question: "Do solar panels need planning permission in a conservation area?", answer: "In a conservation area, solar panels on a roof that faces a road or public space are not permitted development and will require planning permission. Panels on rear-facing roofs are generally still permitted development. For listed buildings, you will need both listed building consent and planning permission regardless of where the panels are located." },
  { question: "Can I install solar panels on a flat roof without planning permission?", answer: "Solar panels on a flat roof are generally permitted development in England as long as they do not protrude more than 1 metre above the roof surface and are set back from the roof edge. The same restrictions for conservation areas and listed buildings apply." },
  { question: "Do ground-mounted solar panels need planning permission?", answer: "Ground-mounted solar panels are permitted development in England if they are no more than 4 metres high, the array is no larger than 9m², you have no more than one standalone installation, and they are not in a conservation area or on designated land. If your installation exceeds these limits, you will need planning permission." },
];

export default function SolarPanelsArticle() {
  return (
    <ArticleLayout
      title="Do you need planning permission for solar panels?"
      description="Solar panels on most homes don't need planning permission. But there are important exceptions — especially for listed buildings, flat roofs, and conservation areas."
      readTime="5 min"
      published="April 2025"
      slug={SLUG}
      datePublished="2025-04-01"
      related={related}
      faq={faq}
    >
      <div className="answer-box">
        <p><strong>Short answer:</strong> No, most solar panel installations in England do <em>not</em> need planning permission. They are permitted development. The main exceptions are listed buildings, certain conservation areas, and installations that project too far above the roofline.</p>
      </div>

      <h2>Solar panels and permitted development rights</h2>
      <p>Since 2008, solar panels have been permitted development for most homes in England under the Town and Country Planning (General Permitted Development) Order. This means you can install them without applying to your local council — provided certain conditions are met.</p>

      <h2>The conditions for permitted development</h2>
      <p>For roof-mounted solar panels to be permitted development, all of the following must apply:</p>
      <ul>
        <li>The panels must not protrude more than <strong>200mm</strong> beyond the roof plane (the flat surface of the roof slope).</li>
        <li>They must not be installed above the highest point of the roof (excluding the chimney).</li>
        <li>On a flat roof, they must not be higher than 1 metre above the highest part of the roof.</li>
        <li>They must not be installed on a wall or roof that fronts a highway if the property is within a conservation area or on designated land.</li>
        <li>When no longer needed, they must be removed as soon as reasonably practicable and the roof returned to its previous condition.</li>
      </ul>

      <div className="warning-box">
        <p>⚠️ <strong>Ground-mounted panels</strong> have slightly different rules. They are permitted development only on domestic properties with certain size limits (no more than 9m² total, no more than 4 metres high). They must not be in a front garden or within 5 metres of the highway. Larger ground-mounted arrays will need planning permission.</p>
      </div>

      <h2>When do you need planning permission for solar panels?</h2>

      <h3>Listed buildings</h3>
      <p>Solar panels are <strong>not</strong> permitted development on listed buildings. You will need both listed building consent and, in most cases, full planning permission. Installations on listed buildings are assessed carefully, with heritage officers often requiring that panels are not visible from public areas or that alternative energy solutions are considered. Approval is possible but not guaranteed.</p>

      <h3>Conservation areas</h3>
      <p>In conservation areas, roof-mounted solar panels are permitted development on roof slopes that are <em>not</em> visible from a highway. If the roof is visible from the road, you will need planning permission. Your local planning authority will consider the visual impact on the character of the conservation area.</p>

      <h3>Other designated land</h3>
      <p>If your home is within a National Park, Area of Outstanding Natural Beauty (AONB), World Heritage Site, or the Norfolk/Suffolk Broads, stricter rules apply. Panels on a principal or side elevation visible from a highway are not permitted development.</p>

      <h3>Article 4 directions</h3>
      <p>Some councils remove permitted development rights in specific areas using Article 4 directions. If an Article 4 direction applies to your property, you may need to apply for planning permission even for a standard roof installation.</p>

      <h3>Flat roofs</h3>
      <p>Ground-mounted-style arrays on flat roofs are generally permitted development, but the 1-metre height restriction above the roof is a common issue. Tilted mounting frames that exceed this height will require planning permission.</p>

      <h2>Do solar panels need Building Regulations approval?</h2>
      <p>Planning permission and Building Regulations are separate requirements. For most solar panel installations, you will not need Building Regulations approval. However, Building Regulations may apply if:</p>
      <ul>
        <li>The installation affects the structural integrity of the roof.</li>
        <li>The electrical installation is not carried out by a competent person registered with an approved scheme (such as MCS-certified installers).</li>
        <li>The work involves creating a new consumer unit or significant alterations to the electrical system.</li>
      </ul>
      <p>Using an MCS-certified (Microgeneration Certification Scheme) installer self-certifies the electrical work, removing the need for a separate Building Regulations application for the electrical component.</p>

      <h2>Battery storage</h2>
      <p>If you're adding a battery storage system alongside solar panels, this is also generally permitted development for domestic properties, subject to size conditions (no more than 1m³ in volume per dwelling, installed outdoors). Internal battery installations don't require planning permission.</p>

      <h2>Do you need permission from your mortgage lender?</h2>
      <p>Technically, yes — installing solar panels may be considered a material alteration to the property under your mortgage conditions. Most lenders will not object, but you should inform them before installation. If you're in a leasehold property, you will also need consent from your freeholder.</p>

      <h2>Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Situation</th>
            <th>Planning permission needed?</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Standard house, panels within 200mm of roof plane</td><td>No</td></tr>
          <tr><td>Conservation area, panels on roof not visible from highway</td><td>No</td></tr>
          <tr><td>Conservation area, panels visible from highway</td><td>Yes</td></tr>
          <tr><td>Listed building</td><td>Yes (listed building consent required)</td></tr>
          <tr><td>National Park / AONB, panels on principal elevation</td><td>Yes</td></tr>
          <tr><td>Ground-mounted, under 9m² and not in front garden</td><td>No</td></tr>
          <tr><td>Ground-mounted, over 9m²</td><td>Yes</td></tr>
          <tr><td>Flat roof array over 1 metre above roof</td><td>Yes</td></tr>
        </tbody>
      </table>
    </ArticleLayout>
  );
}
