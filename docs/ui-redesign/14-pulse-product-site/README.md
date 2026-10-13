# DigiTalent Pulse — connected product website preview

Open [index.html](index.html) in Edge or Chrome. This is a local, English-language interactive design preview. It does not call production APIs, send email, invite real people, take payments, or change company records.

The connected flow now reuses the earlier Pulse visual language instead of opening separate, disconnected mockups. Owner and Manager use the approved Pulse overview composition; Employee Today uses the learning hero and action cards. Blueprint, people, current-versus-target capability, position path, Manager review, course catalog, lesson reader and cycle report carry those same visual patterns while reading one shared preview state. `pulse-reuse.js` and `pulse-reuse.css` contain this visual integration; the existing flow actions remain in `app.js`.

The latest [flow conformance audit](../15-flow-conformance-audit.md) records the source precedence, journey checks, prototype limits and remaining production work. `flow-conformance.js` enforces the latest design rules at the preview interaction layer; `flow-conformance.css` styles the department Manager account selector and capability hierarchy captions.

## Supporting branches from the User Flow and Wireframe

The main visitor → trial → blueprint → baseline → course → Manager assignment review → report journey remains the center of the site. `secondary-flows.js` and `secondary-flows.css` add the connected branches described in *DigiTalent AI User Flow và Wireframe.html*:

| Branch | Where to review it | Browser-local behavior |
| --- | --- | --- |
| Practical task and evidence | Owner **Practical tasks** → Employee **Practice** → Manager **Practical evidence** | Owner sets domain, level, rubric, recipient and due date. Employee submits a note or link. Manager approves, requests revision or rejects with a reason. Approved evidence records its source and can confirm a current level; the original baseline is retained. This is separate from the two-attempt final course assignment. |
| Training cohorts and team follow-up | Owner **Training cohorts** → Manager **Team training** | Assign one free or purchased course to a position or person, check prerequisites and available seats, then follow each learner and due date. |
| Content release | **Platform Admin** → Framework / Curriculum | Edit draft domain descriptions, courses, questions, price and sales status; publish versioned framework or course content. Business users see the published source as read-only. |
| Customer lifecycle | **Platform Admin** → Organizations / Users / Orders / Audit | See the sample organization and its people, grant a paid seat, suspend or restore access, lock or unlock an Employee, and record reasons in an audit view. |
| Account and outcomes | Sign in → **Forgot password** / **Activate invitation**; Owner **Certificates**; Employee Today → **Verified outcomes** / **Activity** | Preview recovery and activation, inspect traceable course or practical-evidence certificates, and read activity. No message is sent. |

Use **Explore sample business**, then the role selector to move between Owner, Manager, Employee and Platform Admin. The Employee primary navigation stays **Today / Path / Practice**; practical tasks and outcome links sit inside those spaces rather than adding more primary tabs. All supporting records use the same `localStorage` state as the main flow. **Reset sample** clears both.

The source wireframe includes older alternatives that later user decisions replaced. This preview keeps the approved unlimited trial with ten Employee seats, the business → department → position ceiling hierarchy, free Basic courses, paid seats per higher course, and Manager grading of final course assignments. Older trial durations, automatic final grading, removal of department ceilings and service packages are not reintroduced.

Practical file inputs show the selected file name only; there is no upload, malware scan or storage. Email recovery, invitation tokens, payments, admin enforcement, question bank releases and certificates are design simulations. Production would require server-side permissions, versioning, audit, document storage and verification.

The preview covers landing, sign in, free business registration, verification, a four-layer capability blueprint, department and position routing, invitations and CSV preview, baseline assessment, current-versus-target gap, the Employee learning path, course details and lessons, a final assignment, AI-assisted Manager review, two-submission policy, and a course-cycle report. Paid courses reuse the same learning and reporting flow after a simulated purchase and seat assignment.

Use **Explore sample business** on the landing page to start with a configured Accounting team. The role switcher in the header lets a reviewer follow one course from Owner through Employee and Manager. State is stored only in this browser with `localStorage`; **Reset sample** clears it. A newly registered business starts with an unpublished blueprint. The free trial has no expiry, offers all Basic lessons, and allows ten Employee seats across departments. The sample second-submission policy is a 48-hour wait and a seven-day deadline; both values are Owner-configurable and are not finalized business policy.

The course-cycle report unlocks when a Manager approves a final course assignment. It derives participation, baseline, targets, activity and review outcome from the preview state. It shows trial and later paid courses in one report space. Production will require backend authorization, persistence, payment, assessment and reporting logic before this design can be applied to the main app.

Owner course details include illustrative feedback cards so the review area can be assessed before purchase. They are clearly labeled as samples; production should show only verified learner reviews. The AI suggestion in Manager review is also an illustrative text check, while the final decision always belongs to the Manager.
