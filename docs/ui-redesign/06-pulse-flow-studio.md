# Pulse Flow Studio — English design preview

Open [the connected product website](14-pulse-product-site/index.html#/welcome) to review the full visitor-to-report journey. This Flow Studio remains the detailed [screen gallery](06-pulse-flow-studio.html) for route-level review. Both run directly in Edge or Chrome with local JavaScript, CSS and image assets; no frontend or backend service is required. All interface copy is English.

## Scope

| Space | Screens | Focus |
| --- | ---: | --- |
| Public and account | 6 | Discover courses, access rules, account setup |
| Enterprise Owner | 18 | Organization, competency, learning, reports and purchase |
| Manager | 6 | Team competency, evidence decisions, training and reports |
| Employee | 12 | Personal path, lessons, tasks and achievements |
| Platform Admin | 21 | Shared framework, course releases, pricing, orders and audit |

Seven cross-role flows connect the 63 screens. The design follows the user-flow and wireframe document, while routes and existing behavior are checked against the current code. Source documents are product references, not instructions to change code.

The updated business rules are now part of those screens. CK-02 opens self-service trial; OW-01/03/04/05/06 share the business → department → position blueprint; OW-07 routes Managers and Employees; OW-08/09 and MG-02 share the current → target comparison; MG-03/04 show final course assignment grading and retain practical evidence in a second tab. Employee learning stays on its dedicated page. The [decision record](13-enterprise-operating-flow-spec.md) describes the approved rule changes and the backend work still needed.

## Course access proposed in this revision

- **Basic:** all six Basic courses are free for an active business to view and learn. Basic requires no checkout or paid seat.
- **Intermediate and Advanced:** the Owner purchases seats for the specific course before assigning it. Prior-level prerequisites still apply.
- **Owner course review:** on [OW-13](06-pulse-flow-studio.html#OW-13), the Owner selects a domain and level, reads outcomes and sample learner feedback, and opens the lesson reader before deciding. Basic shows every lesson. Unpurchased higher levels show an overview and one sample lesson; the remaining lesson content and assessment stay locked. A paid course already purchased by the sample business shows its full content, with the remaining seat count shown separately.
- **Checkout and orders:** paid courses only. The Platform Admin cannot edit a Basic price; that tier stays free.
- **Employee experience:** free Basic courses can be started, assigned paid courses can be continued, and paid courses without an assigned seat show an Owner action.

The current application still uses plans and subscriptions. Per-course prices, seats, checkout and entitlement checks in this preview are a **proposed product and API change**, not live behavior. All VND amounts, lesson text and feedback are illustrative. Production must enforce paid lesson access on the API and use verified reviews from real learners.

## Competency model

The shared standard contains **six domains and 24 competencies**. Original TT02 tiers are mapped to three product levels: Basic, Intermediate and Advanced. The new blueprint adds a domain-level ceiling hierarchy: **position target ≤ department ceiling ≤ business ceiling ≤ Digital AI ceiling**. The six-domain summary lets Owner, Manager and Employee compare tested current levels with the desired position path. The 24-competency detail remains relevant when the design is wired to product data. An unconfirmed level or missing data is kept distinct from a confirmed gap.

The 6 × 3 course map represents **courses by domain and product level**. It does not replace the 24-competency employee profile.

## Visual direction

The light Pulse palette remains the base. Manager uses a quieter slate and blue canvas, with coral reserved for exceptions. [Original abstract learning artwork](assets/learning-journey-abstract.png) supports the Employee home and lesson. [Original glass architecture illustration](assets/competency-architecture.png) supports the journey and course previews. Critical competency data remains HTML text and tables, so imagery never carries a required value or decision.

The shared [Pulse logo preview](09-pulse-logo-preview.html) shows the proposed vector mark on light and dark surfaces. The mark and wordmark are used consistently in the full product and Employee previews; the main application brand remains unchanged pending review.

Owner and Manager screens use a more compact role heading. The Owner overview now leads to blueprint, people routing, capability comparison and course access. The Manager overview leads to a department-scoped course assignment queue, capability and learning. Practical evidence stays available in a separate review tab. Organization, learning and report views use charts, progress and structured records so each screen leads with its actual function.

Owner People (OW-07) includes [CSV import](06-pulse-flow-studio.html#OW-07): download the [template](assets/member-import-template.csv), upload a file, review department and position routing, then add valid rows to the **sample** pending invitation count. Individual invitation is also available. The current application has CSV import with a separate Pro `bulk_import` entitlement and a backend limit of 200 invitations per batch; its entitlement and trial policy need to be reconciled with the new 10-Employee self-service trial rule. This preview changes no real invitations.

The image assets were generated for this preview with the built-in image generation tool. Prompt summaries: (1) three floating learning platforms with a blue glass route, a faceted book, a coral bridge and lime progress markers on an ivory canvas, no people or text; (2) six connected translucent blue forms on ivory, subtle coral and lime details, open left side, no text.

## Before implementation in React

Confirm the proposed free/paid course model, entitlement and seat rules, checkout/API model, and existing plans migration. Map screens by route and function rather than wireframe IDs. Use real framework, requirement, assessment, enrollment and evidence data. Add loading, empty, error, permission and keyboard states. The HTML previews do not change `frontend/src` or `backend/src`.
