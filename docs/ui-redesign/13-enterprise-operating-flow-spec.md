# Enterprise operating flow · design decision record

This is a design preview, not an API implementation. Open the [connected product website](14-pulse-product-site/index.html#/welcome) to follow landing, registration, setup, baseline, learning, Manager review and the course-cycle report in one experience. The [unified Pulse Flow Studio](06-pulse-flow-studio.html#home) remains a route-level screen gallery. The [operating-flow component](13-enterprise-operating-flow-preview.html#trial) can still be opened alone for focused inspection.

## Rules requested by the product owner

1. **Self-service free trial.** Business email verification activates the Owner workspace without Platform Admin approval. There is no trial expiry. All six Basic courses allow full study. Higher courses show an outline until the Owner buys and assigns access. The limit is **10 active or pending Employee invitations across the whole business**; Owner and Manager accounts do not consume these seats.
2. **Publish a competency blueprint before adding people.** The platform defines Digital AI ceilings. The Owner adds departments and positions, customizes business ceilings, then department ceilings, then position targets, with `position target ≤ department ceiling ≤ business ceiling ≤ Digital AI ceiling` for each domain. A parent cannot be lowered below a child without first changing that child. Manager proposals are reviewed by the Owner, who publishes the revised blueprint.
3. **Route by department and position.** Department first selects the Manager and department ceiling. Position inside the department selects exact target levels and courses. If a department has one position, the position is selected automatically. This resolves the Accounting/Marketing example while supporting multiple roles within one department. A Manager sees only their department; the Owner sees the business; each Employee sees their assigned position path.
4. **Compare measured and desired levels.** The baseline assessment records current level per domain. Employee, Manager and Owner see current → position target, the department ceiling and the course ladder. Unconfirmed level is labeled pending and is never treated as a numeric gap.
5. **Grade a final assignment for every course.** The learner completes lessons and the final check, then submits that course's final assignment. The department Manager sees the evidence and rubric, may read AI suggestions, and records the final pass/fail decision and reason. A pass unlocks the next eligible level when access is assigned.
6. **Two total submissions.** After the first fail, focused review and Manager feedback precede one timed final submission. After the second fail, the Manager receives a support flag and decides coaching, a fresh learning cycle or a pause. No certificate or next level is released on failure. The product owner confirmed that **both a waiting period and a deadline** apply. The preview uses an editable sample of a 48-hour wait and a 7-day submission window; the exact values are **not finalized product policy**.

## Source conflicts and implementation gap

`D:/Program Files/QLNS/QLNS/Luồng vận hành Digital AI.html` proposes manual trial approval, a dated trial, a larger team allowance and more resubmissions. The newer user request above takes precedence. The existing backend still has a 14-day trial and 5-account policy in `backend/src/DigiTalent.Application/Trial/TrialPolicy.cs`; it counts different account types and blocks writes on expiry. Course assignment review, department ceiling inheritance, invitation seat policy and the two-submission state machine require backend rules, data migrations, authorization checks and frontend API integration before this preview can become the live product. The prototype uses sample records and local interaction only.

## Review points in the preview

- Change a ceiling above its parent or below a child: the editor rejects it and explains the dependency.
- Change the sample assignment timing and publish the draft.
- Select a department and position when inviting an Employee, or upload the sample CSV to check position routing and the 10-seat limit. The same sample state follows Owner and Manager screens within the Flow Studio session.
- Switch Employee, Manager and Owner views of the same current-versus-target competency map.
- Submit Mia's Accounting Basic assignment, switch to Manager review, record “Not yet”, advance the sample waiting period, submit again, then inspect the support flag after a second failure.

No production records, invitations, payments or assessments are changed by this preview.
