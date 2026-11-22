# tests/e2e (QA-owned)

| Folder | Runner | Status |
|---|---|---|
| `contract/` | Repo Vitest (`npm test` picks up `*.test.ts` anywhere) | Runnable against the bootstrap engine today. Exercises only public engine exports in demo order |
| `browser/` | Playwright (`*.e2e.ts`, deliberately outside Vitest's default pattern) | **Prepared and never executed.** Needs the integrated studio UI and the proposed `data-testid` hooks in `browser/selectors.ts` |

## Contract tests

```powershell
npx vitest run tests/e2e/contract
```

These tests assert demo-critical invariants: one camera feeds the two processed lecture views, the lab change creates a new object, Lecture is preserved, students have no PTZ, the diff comes from the configs, provenance paths exist on disk, mappings are proposed and unverified, and recipes require approval. If an engine change breaks one, the demo story broke. Report it to Jash; don't "fix" the test.

## Browser tests (after integration)

Playwright is **not** a repo dependency. Don't add it to `package.json`. Install it temporarily:

```powershell
npm install --no-save @playwright/test   # leaves package.json and package-lock.json untouched; `npm ci` removes it
npx playwright install chromium
npm run build
npx playwright test -c tests/e2e/browser/playwright.config.ts            # starts `npm run start` on :3000
$env:CANON_DNA_URL = "https://<deployment>.vercel.app"; npx playwright test -c tests/e2e/browser/playwright.config.ts
```

Projects: `projector-1440`, `projector-1440-reduced-motion`, `tablet-768`, `mobile-390`. Artifacts (screenshots, traces, HTML report) go to `tests/e2e/.artifacts/`, which is gitignored.

### Assumptions to confirm with the UI owner

1. Test IDs follow `browser/selectors.ts`. If the UI uses different hooks, change only that file.
2. Selected view tiles expose `aria-pressed="true"` (as the sample `SourceSelector.tsx` does).
3. Diff entries expose `data-change="added|removed|changed|preserved"`.
4. Mode switching happens through the Professor role (`switch-mode` is a professor permission). See `helpers.ts › switchMode`.
5. X-Ray renders one target per `lineage[]` entry: `source-selector`, `classroom-preview`, `workbench-view`.
6. The corrupt-storage spec overwrites every key because the studio's storage key isn't defined yet. Tighten it once the key is known.
