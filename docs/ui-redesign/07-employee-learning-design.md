# Employee · Pulse Learning Experience

Open the [unified Employee learning preview](07-employee-learning-preview.html) directly in Edge or Chrome. It is one English learning workspace with three primary destinations: **Today, Path, Practice**. Course details open in the workspace; the [dedicated lesson page](08-employee-lesson-preview.html?course=communication&lesson=3) contains the full reading, examples, practice prompt and knowledge check. The 12 `EM-*` links in the [full product preview](06-pulse-flow-studio.html) still work: they scroll to a section, open the relevant panel or lead to the lesson page. The [earlier 12-screen gallery](07-employee-learning-screen-gallery.html) is retained for comparison. Neither preview changes the React frontend or backend.

## Learning experience

The Employee space uses one continuous page for discovery and progress. Today leads with the next lesson, practical task and free starting point. Path keeps the six-domain current/target map, level progression and course library together. Practice keeps the task criteria, evidence, Manager feedback, final assessment and certificate together. **Course overview, assessment questions, evidence forms, feedback, account and certificate details** open as contextual panels; closing a panel returns to the same page position. **Actual lesson content** opens on a separate focused page. Its course outline lets the learner switch among four illustrative lesson units, and its back link returns to the same course overview. The top navigation only shows the three destinations that change the learner's mode of work.

The course library distinguishes access states: **Basic is free for an active business**, an assigned Intermediate or Advanced seat is ready to learn, and a paid course without a seat shows an outline and asks the learner to contact the Owner. A course without access cannot open the lesson page, including by entering the preview URL directly. Filters and domain selection update in place. An empty sample domain gives a clear way back to all courses.

The roadmap relates the tested current level to the target of the employee's assigned position and shows the Digital AI → business → department → position ceiling chain. The sample Sales (CRM) targets now match the unified Owner/Manager flow. An unconfirmed level is labeled **Pending** instead of shown as a confirmed gap. Lessons and assessments use a focused reading layout. Practice shows both a final assignment for a specific course and a separate workplace practical task. The final course assignment has two total submissions, a waiting period plus deadline after the first fail, and a Manager support flag after the second fail. Manager feedback identifies what must be revised. Certificates state the competency, level and evidence source. Progress, scores, file selection and records in this preview are illustrative; no submission or purchase reaches an API.

The light Pulse palette remains consistent with the product: canvas `#F8F9FF`, electric blue `#3447CD`, coral `#D8543F`, lime `#C7EF72`, and ink `#17213D`. Existing abstract illustrations add focal points without depicting people. Course access, competency values and actions remain readable text.

## Route map

| Preview | Learner purpose | Current code route or screen |
| --- | --- | --- |
| EM-01 Today | Continue the next meaningful step | `/enterprise/me`, `MyDevelopmentDashboardPage` |
| EM-02 Initial assessment | Establish a baseline | `/enterprise/initial-assessment`, `EmployeeInitialAssessmentPage` |
| EM-03 My competency profile | Compare current and target levels | `/enterprise/me/competency`, `/enterprise/me/skill-gap` |
| EM-04 My learning path | Follow gap and prerequisite checkpoints | `/enterprise/me/learning-path`, `MyLearningPathPage` |
| EM-05 My courses | See free, assigned and locked access | `/enterprise/me/courses`, `MyLearningPage` |
| EM-06 Lesson and quiz | Study and check understanding | `/enterprise/me/courses/:id/lessons/:lessonId` |
| EM-07 Final assessment | Attempt the course assessment | `/enterprise/me/assessments/:id/attempt` |
| EM-08 Assessment result | Understand the next step | `/enterprise/me/assessments/:id/result` |
| EM-09 Course assignment and practical tasks | Review each rubric and submit evidence through its own path | `/enterprise/me/tasks`, `/:id`, `/:id/submit`; course submission needs its own API integration |
| EM-10 Manager feedback | Revise based on a stated reason and timed final attempt | `/enterprise/me/tasks/:id/feedback`; final course feedback needs its own API integration |
| EM-11 My certificates | Review confirmed outcomes | `/enterprise/me/achievements` |
| EM-12 Notifications and profile | Track recent changes | Shared notification and account screens |

The `EM-*` IDs in the wireframe differ from `frontend/src/lib/screens/enterprise/employee.ts`; implementation should match by route and function. The current application uses plans and subscriptions. The Basic-free and paid-seat behavior is a proposed product change that needs matching API and entitlement rules before implementation. Final assessment grading also needs alignment with `learning-api-integration.md`, which describes Manager review for the FINAL submission.

## Implementation checks

Use real enrollment, competency, assessment and evidence data. Add loading, empty, error, permission, prerequisite, due and completion states. Keep keyboard navigation and reduced-motion support. Do not show sample progress or a certificate as an earned real outcome.
