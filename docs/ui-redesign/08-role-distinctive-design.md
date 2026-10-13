# Distinctive role and page design

Open the [Public, Owner, Manager and Platform Admin preview](06-pulse-flow-studio.html) and the [Employee learning preview](07-employee-learning-preview.html) directly in Edge or Chrome. Together they cover 63 English screens. All records and amounts are sample data; no main application code has changed.

The proposed [Pulse logo](09-pulse-logo-preview.html) uses the same SVG mark and wordmark across both previews, with examples on light and dark surfaces.

## Owner and Manager refresh

The 24 Owner and Manager screens use a shorter heading, task-based navigation and more visual data. The Owner overview now leads with a clickable 24-competency map, readiness ring and three decisions: set job targets, inspect confirmed gaps and assign learning. Organization, cohort, assignment, task, report, certificate and access screens each use a layout that reflects the task. The full competency view still exposes every skill, current level, position target and confirmation source.

Owner **OW-07 / Members** now puts CSV import first for larger teams. Download the [English CSV template](assets/member-import-template.csv), fill one person per row, upload or drop it onto the page, inspect valid and invalid rows, and confirm the invitation count. The preview checks email, duplicates, roles, known department and position names, and the 200-person batch limit. A separate tab remains for one-person invitations. The import requires the business's Pro bulk-import entitlement in the current application. This local design preview reads the file in the browser and sends no invitations.

The Manager overview leads with due, resubmitted and near-deadline work. The review queue filters by priority; evidence detail keeps the file, three criteria and decision together, and requires a reason for revision or rejection. Team learning and reports use progress views linked back to individuals. Manager colors remain muted. Both spaces use sample data and retain their existing preview routes.

## What each role should see first

| Space | First decision | Distinctive treatment |
| --- | --- | --- |
| Public | Which course level is available, and what does access require? | Editorial course discovery, visible free and paid labels, account journey |
| Owner | Which confirmed gap should lead to which learning access? | Six domains and 24 competencies, per-person evidence, position targets, course access and seats |
| Manager | Which person or submission needs a decision today? | Quiet slate and blue canvas, priority queue, employee competency profiles, reasoned feedback |
| Employee | What should I learn or submit next? | Separate learning shell, illustrated welcome, course shelf, focused study and task views |
| Platform Admin | What reference, content or price is being changed? | Versioned standard, release sequence, course-level paid price controls and audit context |

Every screen leads with its own task and next action. The Pulse palette is consistent, while page composition follows the work. The Manager uses coral for exceptions and decisions rather than a large bright background. Original generated images are used as supporting visuals; important values and actions stay in accessible HTML text.

## Key interactions to review

1. **OW-06 / PA-15:** select a competency inside one of six domains, set its level and preview the effect before saving. Zero means a position does not require that competency. It is not a confirmed employee level.
2. **OW-02 / OW-08 / OW-09 and MG-01 / MG-02:** open a person's 24-competency profile to see confirmed current level, position target, known gap and evidence. Missing data remains distinct from a confirmed zero.
3. **MG-03 / MG-04:** filter evidence by urgency and resubmission, inspect shared criteria, then approve or request a revision with a reason.
4. **CK-01 / OW-13 / OW-18 / PA-16:** Basic courses are visibly free to view and learn for an active business. Intermediate and Advanced require purchased seats before assignment. Checkout contains paid courses only; Basic has no editable price.
   On **OW-13**, the Owner can inspect outcomes, an open sample lesson and illustrative learner feedback before buying. All Basic lessons are open. Higher levels reveal the full lesson path after purchase; a separate seat count still controls new assignments.
5. **EM-01 to EM-12:** the learner sees free Basic entry points, an assigned paid course, a locked unassigned paid course, a clear competency path, lesson, task and result screens.
6. **PA-08:** the course matrix connects content drafting, question mapping, preview and release, with a visible current and draft version.
7. **OW-07:** use the CSV template to review a batch of members, correct row-level errors in the file, and inspect the final count before sending. Switch to single invitation for a one-off member.

The current code uses plans and subscriptions rather than this proposed per-course purchase model. Confirm entitlement, seat, price, checkout and migration rules before applying this preview to production. Match wireframe screens to code by route and function, because some role screen IDs differ.
