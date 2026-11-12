# Interface language

The interface supports `vi` (default) and `en`. The setting is stored locally as
`digitalent-ui-language`, survives sign-out/reload, and synchronizes across tabs.
It does not modify the user's account, organization configuration, API payloads,
permissions, prices, course IDs, or assessment answers.

## Adding interface copy

- Add Vietnamese source copy and its English equivalent to a catalog in
  `frontend/src/lib/i18n/`. Keep each entry on one line, separated by `|`.
- Render interface strings with `translateUi(copy)` and call `useUiLanguage()`
  unconditionally at the start of the component. This updates existing components
  without remounting them or clearing unsaved state.
- Translate labels, placeholders, tooltips, accessibility labels and validation
  feedback at their display boundary. Never translate form values, option values,
  identifiers, status codes, URLs or payload fields.
- Use explicit `value` attributes on select options and stable IDs as React keys.
- Add parameterized copy such as `{count} / trang|{count} / page` for dynamic labels.
  Numeric parameters only match numeric values; unknown copy remains unchanged.
- Use `uiLocale()` for number/date presentation. Do not change stored dates,
  time zones, currency codes or amounts when changing the interface language.

Names, organization data, authored course/lesson/question content, evidence,
announcements and legal documents retain their source language. Translating these
requires separately authored localized content, rather than rewriting records.
The catalog currently covers shared controls/navigation and the main owner
workflows, with shared terminology also applied to other portals. Remaining
long-form copy and some secondary portal screens fall back to Vietnamese.

Audit source copy by feature, for example:

```powershell
cd frontend
node scripts/audit-ui-copy.mjs organization
node scripts/audit-ui-copy.mjs trial-program
```

The audit is a review aid: it also lists authored content, legal text and examples
that should not automatically be translated. It does not prove full coverage.

## Verification

`src/lib/i18n/__tests__/i18n.test.tsx` checks switching without losing draft form
data, stable select values, persistence, cross-tab synchronization, unavailable
browser storage, relative time, unknown-data fallback and HTML language metadata.
No live credentials are changed by these tests.
