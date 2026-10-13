# Pulse screen and task inventory

This is the review map for all 63 English prototype screens. Routes come from the preview metadata and must be checked against the current router and API before implementation. Each row states the job the screen should help a person complete.

## Public / account

| Screen | Page | Preview-mapped route | Main job |
| --- | --- | --- | --- |
| [CK-01](06-pulse-flow-studio.html#CK-01) | Explore courses | `/business` | Find the right skill, then choose a level. |
| [CK-02](06-pulse-flow-studio.html#CK-02) | Create a business account | `/business/try` | Start with a business identity. |
| [CK-03](06-pulse-flow-studio.html#CK-03) | Sign in | `/login` | One account, the right workspace. |
| [CK-04](06-pulse-flow-studio.html#CK-04) | Reset password | `/forgot-password` | Recover access with a clear next step. |
| [CK-05](06-pulse-flow-studio.html#CK-05) | Activate invitation | `/business/try/verify` | Turn an invitation into access. |
| [CK-06](06-pulse-flow-studio.html#CK-06) | Course details | `/business/courses/:id` | Know what the course unlocks. |

## Enterprise Owner

| Screen | Page | Preview-mapped route | Main job |
| --- | --- | --- | --- |
| [OW-01](06-pulse-flow-studio.html#OW-01) | Business capability blueprint | `/setup` | Publish ceilings before adding people. |
| [OW-02](06-pulse-flow-studio.html#OW-02) | Owner overview | `/enterprise/dashboard` | Design → route → compare → enable learning. |
| [OW-03](06-pulse-flow-studio.html#OW-03) | Departments and ceilings | `/enterprise/departments` | Department ceiling stays below business ceiling. |
| [OW-04](06-pulse-flow-studio.html#OW-04) | Positions and targets | `/enterprise/positions` | Assign exact targets inside each department. |
| [OW-05](06-pulse-flow-studio.html#OW-05) | Position targets | `/enterprise/positions/:id` | Position target stays below department ceiling. |
| [OW-06](06-pulse-flow-studio.html#OW-06) | Capability ceiling editor | `/enterprise/requirements` | Compare and publish all four levels. |
| [OW-07](06-pulse-flow-studio.html#OW-07) | Managers and Employee invitations | `/enterprise/members` | Route by department and position; cap Employees at 10. |
| [OW-08](06-pulse-flow-studio.html#OW-08) | Employee capability comparison | `/enterprise/competency-profiles` | Tested current → published position target. |
| [OW-09](06-pulse-flow-studio.html#OW-09) | Current versus desired capability | `/enterprise/skill-gap` | A measured gap leads to a position course. |
| [OW-10](06-pulse-flow-studio.html#OW-10) | Digital competency framework | `/enterprise/framework` | Read the shared standard. |
| [OW-11](06-pulse-flow-studio.html#OW-11) | Training cohorts | `/enterprise/training-batches` | See each learner within a cohort. |
| [OW-12](06-pulse-flow-studio.html#OW-12) | Create a training cohort | `/enterprise/training-batches/new` | Assign with access already clear. |
| [OW-13](06-pulse-flow-studio.html#OW-13) | Course preview and purchase | `/enterprise/courses` | Review the course before buying. |
| [OW-14](06-pulse-flow-studio.html#OW-14) | Practical tasks | `/enterprise/tasks` | A practical task starts with a rubric. |
| [OW-15](06-pulse-flow-studio.html#OW-15) | Organization reports | `/enterprise/reports` | Reports should answer a real question. |
| [OW-16](06-pulse-flow-studio.html#OW-16) | Certificates | `/enterprise/reports` | A certificate has a traceable source. |
| [OW-17](06-pulse-flow-studio.html#OW-17) | Checkout | `Proposed flow · no live route` | Only paid courses enter checkout. |
| [OW-18](06-pulse-flow-studio.html#OW-18) | Course access and seats | `Proposed flow · no live route` | Free access and paid seats are distinct. |

## Manager

| Screen | Page | Preview-mapped route | Main job |
| --- | --- | --- | --- |
| [MG-01](06-pulse-flow-studio.html#MG-01) | Manager overview | `/enterprise/team` | Prioritize course decisions and team support. |
| [MG-02](06-pulse-flow-studio.html#MG-02) | Team capability comparison | `/enterprise/team/members` | See only the Manager's department. |
| [MG-03](06-pulse-flow-studio.html#MG-03) | Course assignment queue | `/enterprise/reviews` | Grade final assignments by learner, course and attempt; practical evidence stays in another tab. |
| [MG-04](06-pulse-flow-studio.html#MG-04) | Grade a course assignment | `/enterprise/reviews/:submissionId` | Manager decides pass/fail with course rubric and reason. |
| [MG-05](06-pulse-flow-studio.html#MG-05) | Team training | `/enterprise/team/training` | Nudge the right learner. |
| [MG-06](06-pulse-flow-studio.html#MG-06) | Team report | `/enterprise/team/skill-gap` | Use reports to intervene early. |

## Employee

The `EM-*` deep links below resolve in one Employee learning workspace. Today, Path and Practice are the only primary navigation destinations. Course overviews, assessments, evidence, feedback, achievements and account details open as contextual panels. EM-06 opens a dedicated lesson page with complete sample content and a return link to the course overview.

| Screen | Page | Preview-mapped route | Main job |
| --- | --- | --- | --- |
| [EM-01](07-employee-learning-preview.html#EM-01) | Today | `/enterprise/me` | Today |
| [EM-02](07-employee-learning-preview.html#EM-02) | Initial assessment | `/enterprise/initial-assessment` | Initial assessment |
| [EM-03](07-employee-learning-preview.html#EM-03) | My competency profile | `/enterprise/me/competency` | My competency profile |
| [EM-04](07-employee-learning-preview.html#EM-04) | My learning path | `/enterprise/me/learning-path` | My learning path |
| [EM-05](07-employee-learning-preview.html#EM-05) | My courses | `/enterprise/me/courses` | My courses |
| [EM-06](08-employee-lesson-preview.html?course=communication&lesson=3) | Lesson and quiz | `/enterprise/me/courses/:id/lessons/:lessonId` | Dedicated lesson page and check question |
| [EM-07](07-employee-learning-preview.html#EM-07) | Final assessment | `/enterprise/me/assessments/:id/attempt` | Final assessment |
| [EM-08](07-employee-learning-preview.html#EM-08) | Assessment result | `/enterprise/me/assessments/:id/result` | Assessment result |
| [EM-09](07-employee-learning-preview.html#EM-09) | Course assignment and practical task | `/enterprise/me/tasks` | Two distinct evidence paths in one Practice area. |
| [EM-10](07-employee-learning-preview.html#EM-10) | Manager feedback | `/enterprise/me/tasks/:id/feedback` | Feedback, waiting period and final submission deadline. |
| [EM-11](07-employee-learning-preview.html#EM-11) | My certificates | `/enterprise/me/achievements` | My certificates |
| [EM-12](07-employee-learning-preview.html#EM-12) | Notifications and profile | `/enterprise/notifications` | Notifications and profile |

## Platform Admin

| Screen | Page | Preview-mapped route | Main job |
| --- | --- | --- | --- |
| [PA-01](06-pulse-flow-studio.html#PA-01) | Platform overview | `/platform/dashboard` | Keep standards and customers moving. |
| [PA-02](06-pulse-flow-studio.html#PA-02) | Organizations | `/platform/organizations` | Find an organization in context. |
| [PA-03](06-pulse-flow-studio.html#PA-03) | Organization 360 | `/platform/organizations/:id` | Support should leave a trace. |
| [PA-04](06-pulse-flow-studio.html#PA-04) | Platform users | `/platform/users` | Find users across organizations. |
| [PA-05](06-pulse-flow-studio.html#PA-05) | User details | `/platform/users/:id` | History comes before a sensitive action. |
| [PA-06](06-pulse-flow-studio.html#PA-06) | Digital competency framework | `/platform/framework` | One shared digital standard. |
| [PA-07](06-pulse-flow-studio.html#PA-07) | Domain and levels | `/platform/framework/:id` | Understand each competency and level. |
| [PA-08](06-pulse-flow-studio.html#PA-08) | Standard curriculum | `/platform/curriculum` | Eighteen courses, one release lifecycle. |
| [PA-09](06-pulse-flow-studio.html#PA-09) | Standard course | `/platform/courses/:id` | A course has a published version. |
| [PA-10](06-pulse-flow-studio.html#PA-10) | Course editor | `/platform/courses/:id/edit` | Edit simply, preview carefully. |
| [PA-11](06-pulse-flow-studio.html#PA-11) | Question bank | `/platform/questions` | Question coverage matters more than volume. |
| [PA-12](06-pulse-flow-studio.html#PA-12) | Question editor | `/platform/questions/:id` | Write the explanation with the answer. |
| [PA-13](06-pulse-flow-studio.html#PA-13) | Assessment templates | `/platform/assessment-templates` | Balance the assessment blueprint. |
| [PA-14](06-pulse-flow-studio.html#PA-14) | Reference positions | `/platform/positions` | Reference positions speed up setup. |
| [PA-15](06-pulse-flow-studio.html#PA-15) | Reference requirements | `/platform/positions/:id/requirements` | A reference requirement can be inspected. |
| [PA-16](06-pulse-flow-studio.html#PA-16) | Course pricing | `/platform/plans` | Basic is always free. |
| [PA-17](06-pulse-flow-studio.html#PA-17) | Edit course pricing | `/platform/plans/:code` | Price one paid course at a time. |
| [PA-18](06-pulse-flow-studio.html#PA-18) | Orders | `/platform/subscriptions` | Orders cover paid access only. |
| [PA-19](06-pulse-flow-studio.html#PA-19) | Order details | `/platform/subscriptions/:id` | An order unlocks paid assignments. |
| [PA-20](06-pulse-flow-studio.html#PA-20) | Audit log | `/platform/audit-log` | See before and after. |
| [PA-21](06-pulse-flow-studio.html#PA-21) | Platform settings | `/platform/settings` | Configuration has a scope. |

## States to review on every applicable screen

For the updated trial, competency ceilings, department-first routing, current-versus-target map and course-by-course Manager grading, review the [unified Flow Studio](06-pulse-flow-studio.html#home) with its [business rule record](13-enterprise-operating-flow-spec.md). The affected screen links above now open the revised views inside the same role workspace.

Loading, empty, error, permission, validation, success, locked access, long data, keyboard focus and mobile layout. The prototype uses sample records; these states and routes need real data and authorization checks when the design moves into the application.
