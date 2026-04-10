import type { Metadata } from "next";
import ArticleLayout from "@/components/ArticleLayout";

const SLUG = "do-you-need-planning-permission-for-a-pergola";
const TITLE = "Do You Need Planning Permission for a Pergola?";
const DESC = "Pergolas often fall under permitted development, but height, size, and proximity to boundaries are easy to get wrong. Find out exactly what the rules say for your garden.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["planning permission pergola", "pergola permitted development", "do I need planning permission for a pergola", "garden structure planning rules", "pergola height limit UK"],
  authors: [{ name: "PlanningPerm", url: "https://planningperm.com" }],
  alternates: { canonical: `https://planningperm.com/blog/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESC,
    type: "article",
    url: `https://planningperm.com/blog/${SLUG}`,
    publishedTime: "2025-04-01T00:00:00Z",
    authors: ["PlanningPerm"],
    tags: ["pergola", "garden structures", "planning permission", "permitted development"],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const related = [
  { title: "Planning permission for a conservatory", href: "/blog/do-you-need-planning-permission-for-a-conservatory", readTime: "6 min" },
  { title: "How much does planning permission cost?", href: "/blog/how-much-does-planning-permission-cost-uk", readTime: "7 min" },
  { title: "Planning permission for solar panels", href: "/blog/do-you-need-planning-permission-for-solar-panels", readTime: "5 min" },
];

const faq = [
  { question: "Do I need planning permission for a pergola in England?", answer: "Most pergolas in England do not need planning permission under permitted development rights, as long as they are in the garden (not in front of the house), do not exceed 2.5 metres in height if within 2 metres of a boundary, do not exceed 4 metres in height overall (3 metres with a flat roof), and the total area of all outbuildings including the pergola does not exceed 50% of the garden. Pergolas in conservation areas or attached to listed buildings have additional restrictions." },
  { question: "How tall can a pergola be without planning permission?", answer: "In England, a pergola can be up to 4 metres tall without planning permission if it has a dual-pitched roof, or 3 metres for any other roof type. However, if the pergola is within 2 metres of a property boundary, the maximum height is 2.5 metres. These limits apply under permitted development rights." },
  { question: "Does a pergola count as an outbuilding for planning purposes?", answer: "Yes, for planning purposes a pergola is treated as an outbuilding or garden structure. This means it counts towards the 50% garden coverage rule — the total area of all outbuildings, sheds, and garden structures combined must not exceed 50% of the land around the original house." },
  { question: "Do I need planning permission for a pergola in a conservation area?", answer: "In a conservation area, you cannot build an outbuilding or garden structure (including a pergola) on any side of the house that faces a road or public space without planning permission. Structures in the rear garden may still be permitted development, but the same height and size limits apply." },
];

export default function PergolaArticle() {
  return (
    <ArticleLayout
      title="Do you need planning permission for a pergola?"
      description="Pergolas often fall under permitted development, but the rules on height, size, and proximity to boundaries are easy to get wrong. Find out exactly what applies to your property."
      readTime="5 min"
      published="April 2025"
      slug={SLUG}
      datePublished="2025-04-01"
      related={related}
      faq={faq}
    >
      <div className="answer-box">
        <p><strong>Short answer:</strong> Most pergolas in England do <em>not</em> need planning permission under permitted development rights — but only if they stay within strict height and size limits. The key rules to watch are the 2.5 metre height limit near boundaries and the overall garden coverage limit.</p>
      </div>

      <h2>How planning rules treat a pergola</h2>
      <p>Planning law in England doesn't specifically define a "pergola." Instead, pergolas are treated as <strong>outbuildings</strong> — the same category as garden sheds, summerhouses, garden offices, and gazebos. This means the permitted development rules for outbuildings apply directly to pergolas.</p>

      <h2>Permitted development rules for pergolas and outbuildings</h2>
      <p>Under the Town and Country Planning (General Permitted Development) Order, a pergola is permitted development if it meets all of the following conditions:</p>

      <h3>Height limits</h3>
      <ul>
        <li>Maximum height: <strong>4 metres</strong> if the pergola has a dual-pitched roof; <strong>3 metres</strong> for any other type (including flat roofs and open-topped structures).</li>
        <li>If the pergola is within <strong>2 metres of any boundary</strong>, the maximum height is <strong>2.5 metres</strong> — regardless of the roof type. This is the most commonly breached rule.</li>
      </ul>

      <h3>Size and coverage limits</h3>
      <ul>
        <li>The pergola must not cover more than <strong>50% of the total garden area</strong> when combined with any other outbuildings or extensions. Only the land around the original house counts, not any later additions.</li>
        <li>If the pergola is to be used as a sleeping space (unlikely but possible for large structures), the maximum floor area is 15m².</li>
      </ul>

      <h3>Position</h3>
      <ul>
        <li>A pergola must not be positioned in front of the <strong>principal elevation</strong> of the house (the side facing the road).</li>
        <li>It must not be built forward of the building line — i.e. it can't project forward of the front of the house.</li>
      </ul>

      <div className="warning-box">
        <p>⚠️ <strong>The 2-metre boundary rule is the most common stumbling block.</strong> If your pergola will be within 2 metres of your fence or wall — including a side or rear boundary — it must not exceed 2.5 metres in height. Many standard pergola kits are 2.4–2.6 metres tall, which can put you right on the edge of compliance.</p>
      </div>

      <h2>Does a pergola need planning permission?</h2>
      <p>If your pergola meets all the conditions above, no planning permission is needed. But you will need permission if:</p>

      <h3>You're in a conservation area</h3>
      <p>Permitted development rights are more restricted in conservation areas. Any outbuilding — including a pergola — that would be to the side of the house requires planning permission. Even rear-garden pergolas may need permission if they affect the character of the area, depending on your council's interpretation.</p>

      <h3>Your home is listed</h3>
      <p>Listed building consent is required for any works that affect the character of a listed building or its curtilage, which typically includes the garden. Even a simple pergola in the garden of a listed building will usually require listed building consent.</p>

      <h3>The pergola is attached to the house</h3>
      <p>If the pergola is structurally attached to the main house — for example, fixed to an external wall — it may be treated as an extension rather than an outbuilding. Extension rules have different size limits and conditions, and an attached pergola that adds covered floor space could require planning permission under extension rules.</p>

      <h3>Your property has had permitted development rights removed</h3>
      <p>Some properties have had their permitted development rights removed by an Article 4 direction, a condition of a previous planning permission, or because the property is a flat or new-build where PD rights were excluded. Always check before you build.</p>

      <h2>Does a pergola need Building Regulations approval?</h2>
      <p>A standard open-sided pergola used as a garden feature does not normally require Building Regulations approval. However, you may need approval if:</p>
      <ul>
        <li>The pergola has an enclosed floor area over 15m² and is less than 1 metre from the boundary (fire risk).</li>
        <li>It incorporates electrical wiring or lighting.</li>
        <li>It is structurally attached to the house.</li>
      </ul>
      <p>Electrical work in a garden structure should always be carried out or certified by a Part P-registered electrician.</p>

      <h2>What about a bioclimatic pergola or louvred roof?</h2>
      <p>Modern bioclimatic pergolas with motorised louvred roofs are increasingly popular. For planning purposes, these are still treated as outbuildings, so the same rules apply. However, because they often have a more substantial structure and may be used as an all-weather room, councils may scrutinise them more closely in sensitive areas. The same height and boundary rules apply.</p>

      <h2>Practical tips before you build</h2>
      <ul>
        <li><strong>Measure the distance to your nearest boundary carefully</strong> — not just the fence, but where the legal boundary line falls, which may be a different measurement.</li>
        <li><strong>Check how much of your garden is already covered</strong> by sheds, extensions, and other structures. The 50% rule applies cumulatively.</li>
        <li>If you're close to the limits, consider applying for a <strong>Lawful Development Certificate</strong> (£103) before building — this gives you a formal legal confirmation that no planning permission is needed.</li>
        <li><strong>Check your title deeds</strong> for any covenant or restriction that could prevent outbuildings in your garden, independent of planning law.</li>
      </ul>

      <h2>Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Situation</th>
            <th>Planning permission needed?</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Rear garden, over 2m from boundary, under 3m tall</td><td>No</td></tr>
          <tr><td>Within 2 metres of boundary, under 2.5m tall</td><td>No</td></tr>
          <tr><td>Within 2 metres of boundary, over 2.5m tall</td><td>Yes</td></tr>
          <tr><td>Front garden (in front of principal elevation)</td><td>Yes</td></tr>
          <tr><td>Conservation area, to the side of the house</td><td>Yes</td></tr>
          <tr><td>Listed building</td><td>Yes (listed building consent)</td></tr>
          <tr><td>Attached to the house</td><td>Likely yes (treated as extension)</td></tr>
          <tr><td>Over 50% garden coverage (combined with other structures)</td><td>Yes</td></tr>
        </tbody>
      </table>
    </ArticleLayout>
  );
}
