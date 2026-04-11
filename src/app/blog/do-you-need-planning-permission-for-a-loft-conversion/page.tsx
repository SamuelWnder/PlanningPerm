import type { Metadata } from "next";
import ArticleLayout from "@/components/ArticleLayout";

const SLUG = "do-you-need-planning-permission-for-a-loft-conversion";
const TITLE = "Do You Need Planning Permission for a Loft Conversion? (2026)";
const DESC = "Most loft conversions are permitted development — but volume limits, dormer rules, and location all affect whether you need planning permission. Here's the complete 2026 guide.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    "do you need planning permission for a loft conversion",
    "loft conversion planning permission",
    "loft conversion permitted development",
    "do i need planning permission for a loft conversion",
    "loft conversion building regulations",
    "planning permission for loft conversion",
    "loft conversion rules uk",
    "loft conversion without planning permission",
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
    tags: ["loft conversion", "planning permission", "permitted development", "UK housing"],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const related = [
  { title: "Do you need planning permission for an extension?", href: "/blog/do-you-need-planning-permission-for-an-extension", readTime: "7 min" },
  { title: "How much does planning permission cost?", href: "/blog/how-much-does-planning-permission-cost-uk", readTime: "7 min" },
  { title: "Planning permission for a conservatory", href: "/blog/do-you-need-planning-permission-for-a-conservatory", readTime: "6 min" },
];

const faq = [
  {
    question: "Do I need planning permission for a loft conversion in England?",
    answer: "Most loft conversions in England do not need planning permission under permitted development rights, as long as the total additional roof space does not exceed 40 cubic metres for terraced houses or 50 cubic metres for detached and semi-detached houses. The conversion must not alter the roof slope on the front elevation, and any side-facing windows must be obscure-glazed. However, planning permission is required if your property is listed, in a conservation area, or if the volume limits are exceeded.",
  },
  {
    question: "How much volume can I add to a loft without planning permission?",
    answer: "In England, you can add up to 40 cubic metres of additional roof space on a terraced house without planning permission, or up to 50 cubic metres on a detached or semi-detached house. This is the total volume added above the original roof — if previous loft work has already been done, that counts towards your allowance.",
  },
  {
    question: "Do I need planning permission for a dormer loft conversion?",
    answer: "A dormer loft conversion at the rear of the house usually falls under permitted development, provided it stays within the volume limits (40m³ for terraced, 50m³ for detached/semi) and does not exceed the height of the existing roof. Dormers on the front slope of the roof that would be visible from the road do require planning permission, as this is explicitly excluded from permitted development.",
  },
  {
    question: "Do loft conversions need Building Regulations approval?",
    answer: "Yes — unlike some other works, all loft conversions require Building Regulations approval regardless of whether planning permission is needed. Building Regulations cover structural integrity (floors, beams, walls), fire safety (escape windows, protected staircase), insulation, and the new staircase. You must notify your local authority or use an approved inspector before starting work.",
  },
  {
    question: "Can I convert a loft in a conservation area without planning permission?",
    answer: "In a conservation area, you cannot add a dormer window or any other alteration to a roof slope visible from a road without planning permission — this right is removed in conservation areas. However, internal conversions that do not change the external roof profile may still be permitted development. Always check with your local planning authority first.",
  },
];

export default function LoftConversionArticle() {
  return (
    <ArticleLayout
      title="Do you need planning permission for a loft conversion?"
      description="Most loft conversions are permitted development — but volume limits, dormer rules, and front-elevation restrictions mean it's not always straightforward. Here's exactly what you need to know."
      readTime="8 min"
      published="April 2026"
      slug={SLUG}
      datePublished="2026-04-06"
      related={related}
      faq={faq}
    >
      <div className="answer-box">
        <p><strong>Short answer:</strong> Most loft conversions in England do <em>not</em> need planning permission under permitted development rights — but there are strict volume limits, and dormers facing the front of the house always need permission. Building Regulations approval is required for every loft conversion, even those that don't need planning permission.</p>
      </div>

      <h2>What counts as permitted development for a loft conversion?</h2>
      <p>In England, loft conversions fall under Class B of Schedule 2 to the Town and Country Planning (General Permitted Development) (England) Order 2015. This grants automatic planning permission for roof extensions as long as they comply with all the conditions — you don't need to apply, but you must stay within the rules.</p>

      <h2>The permitted development rules for loft conversions</h2>

      <h3>Volume limits</h3>
      <p>The most important rule is the cubic metre limit on how much additional roof space you can create:</p>
      <ul>
        <li><strong>Terraced houses:</strong> Maximum 40 cubic metres of additional roof space.</li>
        <li><strong>Detached and semi-detached houses:</strong> Maximum 50 cubic metres of additional roof space.</li>
      </ul>
      <p>This is the total additional volume above the original roof. If a previous owner has already added a dormer or roof extension, that volume counts towards your allowance — even if it was built before you bought the property.</p>

      <h3>Roof height</h3>
      <ul>
        <li>The extension must not exceed the height of the <strong>highest point of the existing roof</strong>.</li>
        <li>You cannot raise the ridge line or add any element that projects above the existing roof ridge.</li>
      </ul>

      <h3>Front elevation rule</h3>
      <p>Any alteration to the <strong>front slope of the roof</strong> — the side that faces the road — is <em>not</em> permitted development. This means:</p>
      <ul>
        <li>Dormers on the front slope require full planning permission.</li>
        <li>Rooflights on the front slope are only permitted if they do not project more than 150mm above the existing roof plane.</li>
        <li>Any other protrusion on the front slope needs planning permission.</li>
      </ul>

      <h3>Side-facing windows</h3>
      <ul>
        <li>Any window in a side-facing wall of a roof extension must be <strong>obscure-glazed</strong>.</li>
        <li>Any openable part of such a window must be at least <strong>1.7 metres above the floor</strong> of the room it serves.</li>
        <li>This prevents overlooking neighbouring properties.</li>
      </ul>

      <h3>No balconies or raised platforms</h3>
      <p>The loft conversion must not include a veranda, balcony, or raised platform. A Juliet balcony (a fixed railing with no walkable surface) may be permitted if it does not project from the roof plane, but you should confirm this with your council.</p>

      <h3>Materials</h3>
      <p>Materials used in the roof extension should be <strong>similar in appearance</strong> to the existing house. This is a judgement-based condition, but using matching or complementary tiles and render significantly reduces the risk of enforcement.</p>

      <div className="warning-box">
        <p>⚠️ <strong>Permitted development does not apply to flats, maisonettes, or houses created by converting commercial buildings.</strong> If your home is not a house in its original form, you will need planning permission for any loft conversion.</p>
      </div>

      <h2>When do you need planning permission for a loft conversion?</h2>

      <h3>The volume limit is exceeded</h3>
      <p>If your planned conversion would add more than 40m³ (terraced) or 50m³ (detached/semi), you need full planning permission. This is common with large L-shaped dormers or when a previous conversion has already used some of the allowance.</p>

      <h3>You want a front dormer</h3>
      <p>Front dormers are explicitly excluded from permitted development. If you want a dormer on the street-facing slope — which is rare but occasionally happens on rear-facing houses — you will need to apply for planning permission.</p>

      <h3>Listed buildings</h3>
      <p>Any alteration to a listed building's exterior requires <strong>listed building consent</strong>, regardless of scale. Loft conversions on listed buildings are heavily scrutinised and often require specialist conservation architects. Permitted development rights do not apply.</p>

      <h3>Conservation areas</h3>
      <p>In conservation areas, permitted development rights for roof extensions are more restricted. Specifically, any addition to a roof slope that faces a highway or open space cannot be done under PD — it requires planning permission. This typically means that even a rear dormer needs permission if the rear of the house faces a road, alley, or public footpath.</p>

      <h3>Article 4 directions</h3>
      <p>Some councils apply Article 4 directions that remove permitted development rights entirely from certain areas. These are common in conservation areas and dense urban settings. If an Article 4 direction covers your property, you will need planning permission even for works that would otherwise be PD.</p>

      <h3>Hip-to-gable conversions</h3>
      <p>A hip-to-gable loft conversion changes the sloped end of a hipped roof into a vertical gable wall, creating more headroom inside. These are generally permitted development on detached and semi-detached houses (not terraced), provided they stay within the volume limit and don't exceed the ridge height. However, if the gable would face a road, planning permission will be required.</p>

      <h3>Mansard roof conversions</h3>
      <p>A mansard conversion involves rebuilding the rear roof slope at a steep angle (typically 72°) with a flat section at the top. Rear mansards on terraced houses in London are common and are generally permitted development within the volume limits. However, any mansard element on the front elevation requires planning permission.</p>

      <h2>Do loft conversions require Building Regulations approval?</h2>
      <p>Yes — <strong>every loft conversion requires Building Regulations approval</strong>, regardless of whether planning permission is needed. This is the most important distinction between loft conversions and some other permitted development works. Building Regulations cover:</p>
      <ul>
        <li><strong>Structure:</strong> The existing ceiling joists are rarely strong enough to use as a floor — structural calculations and upgraded beams are almost always required.</li>
        <li><strong>Fire safety:</strong> A loft conversion creates an additional storey. Building Regulations require a protected fire escape route — typically a fire-rated staircase and fire doors on each landing — and an escape window in the loft room itself.</li>
        <li><strong>Stairs:</strong> The new staircase must meet minimum headroom and pitch requirements.</li>
        <li><strong>Insulation:</strong> The roof must be insulated to current standards.</li>
        <li><strong>Party walls:</strong> If you share a wall with a neighbour, the <strong>Party Wall Act 1996</strong> requires you to serve notice before starting work.</li>
      </ul>
      <p>You can use either your local authority's Building Control service or an approved inspector. A completion certificate is essential — without it, you will face problems when selling the property.</p>

      <h2>Do you need a Party Wall Agreement?</h2>
      <p>If your property is semi-detached or terraced, you will almost certainly need a <strong>Party Wall Agreement</strong> before starting a loft conversion. You must serve a Party Wall Notice on your neighbour(s) at least two months before work begins. If they consent in writing, you can proceed. If they don't respond or dispute the notice, you'll need to appoint a party wall surveyor to draw up an award.</p>

      <h2>How to check if you need planning permission</h2>
      <p>The permitted development rules above are the national defaults for England. Whether they apply to your specific property depends on your house type, location, and planning history. The quickest way to check is to use PlanningPerm — we run automated checks against conservation area boundaries, listed building registers, Article 4 directions, and your property's existing planning history.</p>

      <h2>Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Situation</th>
            <th>Planning permission needed?</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Rear dormer, within volume limits (terraced ≤ 40m³, other ≤ 50m³)</td><td>No</td></tr>
          <tr><td>Rear dormer, exceeds volume limits</td><td>Yes</td></tr>
          <tr><td>Front dormer (visible from road)</td><td>Yes</td></tr>
          <tr><td>Rooflight on rear slope, not projecting &gt; 150mm</td><td>No</td></tr>
          <tr><td>Rooflight on front slope, projecting &gt; 150mm</td><td>Yes</td></tr>
          <tr><td>Hip-to-gable (detached/semi), within limits</td><td>No</td></tr>
          <tr><td>Conservation area, dormer facing highway</td><td>Yes</td></tr>
          <tr><td>Listed building (any alteration)</td><td>Yes (listed building consent)</td></tr>
          <tr><td>Flat or maisonette</td><td>Yes</td></tr>
          <tr><td>Building Regulations approval</td><td>Always required</td></tr>
        </tbody>
      </table>
    </ArticleLayout>
  );
}
