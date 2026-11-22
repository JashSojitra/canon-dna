# Canon DNA — demo runbook (operator one-pager)

**Operator:** Jash · **Narrator / backup:** Vani · **Script:** `docs/pitch-outline.md`
**Status:** pre-integration draft. Control names marked `[ANTICIPATED]` must be confirmed against the merged UI at the first integrated rehearsal.

## 1. Fixed parameters

| Item | Value |
|---|---|
| Live URL | `https://________________.vercel.app` (fill in after the production deploy from `main`) |
| Local fallback | `http://localhost:3000` (production build, see §5) |
| Browser | Chrome stable, **dedicated demo profile**, no extensions, bookmarks bar hidden |
| Resolution | **1440×900** CSS px, zoom **100%**, full screen (F11). If the projector forces 1920×1080, set Windows scale so the window is 1440 wide, or use zoom 133% only if checklist §13 passes |
| Display | Laptop mirrored (not extended) to the projector. Notifications off (Windows Focus Assist on) |
| Power / net | Charger connected. Phone hotspot ready as a second network |
| Tabs (in order) | 1: Live URL · 2: Local fallback · 3: Backup screenshots folder / video · 4: Slide PDF |
| Tag | Demo only from the commit tagged `demo-freeze` |

## 2. Demo state reset (before every rehearsal and 10 minutes before the pitch)

1. Open the live URL in the demo profile.
2. DevTools (F12) → **Application** → **Storage** → **Clear site data** (clears localStorage and the approved recipe).
3. Close DevTools. Hard reload (`Ctrl+Shift+R`).
4. Confirm the Library shows **2 sample tiles and no approved recipe**.
5. Confirm the Architect input has the lecture prompt pre-filled (do not type it).
6. Do the same on the local fallback tab (localhost has its own separate storage).
7. Leave the browser on **Library**, full screen.

If the UI ships an in-app "Reset demo" control, use it, *and* still verify step 4.

## 3. Exact click sequence and time markers

Prompts must match `src/data/demo-prompts.ts`. The engine accepts only these strings (case and surrounding whitespace ignored). If an input has to be re-entered, paste from here and never retype:

- Lecture: `Build a university classroom with Professor and Whiteboard views from one camera, digital Slides, Professor controls, and a remote Student viewer.`
- Lab: `Tomorrow is a lab. Add a Workbench camera, let students choose four views, and keep Lecture mode unchanged.`

| Time | Who | Action | Must see |
|---|---|---|---|
| 0:00 | Vani | Slide 1 → Slide 2 (problem) | — |
| 0:35 | Jash | Switch to the browser (Library) | 2 sample tiles |
| 0:45 | Jash | `Analyze DNA` on AMLOS Classroom [ANTICIPATED] | Graph: 2 nodes, 1 edge |
| 0:55 | Jash | Click the **Source Selector** node | Path `src/sample-apps/classroom/SourceSelector.tsx` |
| 1:03 | Jash | Click the **Classroom Preview** node | Dependency on Source Selector |
| 1:12 | Jash | Go to **Architect** | Lecture prompt pre-filled |
| 1:20 | Jash | `Generate design` [ANTICIPATED] | Rules-mode badge. REUSE + ADAPT with reasons |
| 1:40 | Jash | Open **Preview** → role **Student** | 3 views |
| 1:48 | Jash | Focus Professor → Whiteboard → Slides | Focus changes |
| 1:58 | Jash | (Skip if behind) Show no PTZ for Student | No PTZ control |
| 2:10 | Jash | Lab prompt → `Apply change` [ANTICIPATED] | Workbench inserted, 4 views |
| 2:28 | Jash | Mode **Laboratory** → focus Workbench | Workbench focused |
| 2:38 | Jash | Mode **Lecture** | Original 3 views |
| 2:46 | Jash | Toggle **Before/After** | Diff: added ×3+, Lecture preserved |
| 3:07 | Jash | Toggle **DNA X-Ray** | Silhouettes + inspector |
| 3:15 | Jash | Click Source Selector region | REUSE · file path |
| 3:30 | Jash | Click Workbench region | NEW · Camera+Hub · verification item |
| 3:45 | Jash | (Only if ahead) Hidden-view warning | `no-line-of-sight` review |
| 3:58 | Jash | `Esc` | X-Ray closed |
| 4:07 | Jash | **Blueprint** | Camera/Hub/Edge *Proposed · Unverified* |
| 4:22 | Jash | `Approve design` | Approved state |
| 4:28 | Jash | **Library** → `F5` | Recipe still listed |
| 4:45 | Vani | Final slide, close | — |
| 5:00 | — | Stop | — |

**Checkpoints:** if the clock passes **2:15** before the lab change starts, or **4:15** before Approve, apply the cut rules in `docs/pitch-outline.md` → *Timing buffer rules*.

## 4. Fallback triggers (decide in under 5 seconds)

| Symptom | Action |
|---|---|
| Live URL fails to load / 5xx / blank | Tab 2 (localhost production build). Run the reset first if there's time; otherwise continue from the current stage |
| A click does nothing for more than 3 s, or a white screen / error overlay | Say the failure line, then Tab 3 → step through the backup screenshots matching the current stage. Vani keeps narrating |
| Generate or Apply returns "use a supplied demo prompt" | Select all in the input, paste the exact prompt from §3, retry once. If it fails again → screenshots |
| Projector lacks resolution / text unreadable | `Ctrl` + `+` once. If still bad → present from the slide PDF screenshots |
| Laptop dies | Vani's laptop has the PDF + video. Continue with the video |

**Network/API failure:** the main demo must need **no** network after page load (no LLM call, no external media). If venue Wi-Fi drops *after* the page has loaded, keep going in the same tab. Do not reload. If an optional LLM route is merged and fails, the UI must show rules mode; continue and say "rules mode", never imply a live model ran.

## 5. Local production fallback (prepare Sunday morning)

```powershell
# in a clean checkout of the demo-freeze tag
git fetch origin --tags
git switch --detach demo-freeze
npm ci
npm run build
npm start        # serves http://localhost:3000
```

Verify with Wi-Fi **off**: full path completes, no console errors. Keep this terminal open during the pitch.

## 6. Deployment checks (Jash, after the final merge to `main`)

- [ ] Vercel production deploy is from `main` at the `demo-freeze` commit. The commit hash in the Vercel dashboard matches `git rev-parse demo-freeze`.
- [ ] Vercel Node version matches `package.json` engines (`^22.13.0 || >=24`).
- [ ] No environment variables are required. If an LLM key is set, the no-key path was also tested.
- [ ] A fresh incognito window on a **different device** (a phone on cellular) loads the URL and completes Library → Approve.
- [ ] DevTools Network on the deployed URL: no third-party requests and no 404s for media.
- [ ] Console clean on the deployed URL (production may differ from dev).
- [ ] Response time on first load under 3 s on venue Wi-Fi.
- [ ] Stop merging 45–60 min before the deck deadline unless it's a critical demo blocker (`RUN_OF_SHOW.md` §4).

## 7. Screenshot / video backup plan

1. After `demo-freeze`, run the full path once at 1440×900 on the clean profile and capture **S-01 … S-09** (list in `docs/slides-outline.md`). Add these extra fallback frames:
   - **B-01** Architect result
   - **B-02** Preview with Student role and the Slides view focused
   - **B-03** Laboratory mode with Workbench focused
   - **B-04** Lecture mode shown again after the lab update
   - **B-05** Blueprint after approval
2. Screen-record one full clean 5-minute run (Windows `Win+Alt+R` / Xbox Game Bar, or OBS). Export MP4 ≤ 1080p.
3. Store the screenshots, video, and PDF in: (a) the laptop desktop folder `CanonDNA_Backup`, (b) a USB stick, (c) the team Drive. Vani has a copy on her laptop.
4. Name the files in click order (`01-library.png`, `02-extract.png`…) so arrow keys in the Windows Photos app step through the story.
5. If the automated Playwright run (`tests/e2e/browser/`) produces stage screenshots, review them by eye before relying on them.

## 8. Freeze and deadline

- [ ] When the checklist (`docs/qa-checklist.md`) sign-off rows are PASS on `main`, Jash tags the release: `git tag -a demo-freeze -m "Demo freeze" <commit>` then `git push origin demo-freeze`. After that, no feature merges.
- [ ] Two full timed rehearsals with both presenters (Sun 9:15–10:00 AM ET).
- [ ] PDF deck exported, opened on a second machine, **uploaded before 12:00 PM ET Sunday Nov 22, 2026** (target 11:00 AM). Screenshot of the submission confirmation saved.
- [ ] Re-run the reset (§2) 10 minutes before going on stage.
