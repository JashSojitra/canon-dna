# Canon DNA — five-minute pitch (two presenters)

**Status:** DRAFT v1, written before the studio UI was integrated. Every click below is an *anticipated* control based on `CANON_DNA_EXECUTION_PLAN.md` §2 and `docs/contracts.md`. After the integration merge, QA replaces each `[ANTICIPATED]` label with the real control name and retimes the script during rehearsal.

- **Jash** (operator, technical): drives the laptop and narrates system behaviour.
- **Vani** (narrator, business): opens and closes, and explains the user pain and the value to Canon. She advances slides and holds the backup clicker.
- **Total:** 5:00, demo included. After it, 3:00 of Q&A (crib sheet at the end).
- **Screen:** 1440×900 browser, full screen, studio already open on **Library** with clean storage (see `docs/demo-runbook.md`).

## Claims discipline (read before every rehearsal)

| Say | Never say |
|---|---|
| "Canon's customization process takes about **three months** today. Canon's stated target is about **three weeks**." | "We cut it to three weeks." / "We measured X% faster." |
| "A **path** to fewer engineering iterations." | "Proven time savings." Any number we did not measure. |
| "**Team-created sample** React applications." | "Canon's code", "customer repositories", "we scanned Canon's source". |
| "**Manifest-backed** component analysis." | "AI read the whole codebase." |
| "**Proposed** Camera/Hub/Edge mapping. Engineering verification required." | "Integrated with the AMLOS SDK." |
| "**Simulated** media sources." | "Live camera feeds." |
| "**Demo rules mode**" (unless a real LLM call visibly ran) | "The AI understood…" while the rules mode badge is showing. |
| "Recipe saved to the **local** library." | "The model learned / retrained." |

The engine currently runs in `rules-demo` interpretation mode only (`src/lib/engine/index.ts`, `interpretRequirements`). Unless an LLM route is merged *and* its badge is visible on screen, describe the Architect as **rule-based structured interpretation with validation**.

---

## Timed script

### 0:00–0:35 · The problem (Vani · slide 1, then slide 2)

**Click:** Vani is on Slide 1 (title). At 0:10 she advances to Slide 2 (problem).

> **Vani:** "Canon builds AMLOS applications for each customer: a university, a hospital, a training centre. Each one is customized. Today that customization takes roughly **three months**. Canon's goal is about **three weeks**.
>
> Most of that time is not new engineering. It's rediscovering decisions Canon has already made: which camera produces which view, who is allowed to control what, how the screens are laid out. Those decisions live inside finished applications and get rebuilt from scratch.
>
> Canon DNA asks one question: **why start from zero when the last approved application already holds the answer?**"

**Handoff (0:33):** "Jash will show you on a real example."

### 0:35–1:10 · Library and DNA extraction (Jash)

**Click 1 (0:37):** Switch to the browser (Alt-Tab or the slide's demo link). The studio shows **Library**.
**Click 2 (0:45):** On the **AMLOS Classroom** tile, click `Analyze DNA` [ANTICIPATED].
**Click 3 (0:55):** In the extraction graph, click the **Source Selector** node. The inspector shows `src/sample-apps/classroom/SourceSelector.tsx`.
**Click 4 (1:03):** Click the **Classroom Preview** node to show its dependency edge to Source Selector.

> **Jash:** "These are two sample applications our team built to stand in for prior Canon work: a Classroom app and a Remote Training app. They're our own code, clearly labelled, not Canon's.
>
> Analyze DNA reads each app's component manifest. Every node here is a real file in the repository. Here's the Source Selector, its path, and what depends on it. Nothing here is invented."

**Do not** describe the graph as automatic code parsing. It is manifest-backed.

### 1:10–2:05 · Architect → three-view university app (Jash, Vani bridge)

**Click 5 (1:12):** Go to the **Architect** stage.
**Click 6 (1:15):** The lecture request is already in the input. **Do not retype it.** The bootstrap engine accepts only the supplied prompt, ignoring case and surrounding whitespace:
`Build a university classroom with Professor and Whiteboard views from one camera, digital Slides, Professor controls, and a remote Student viewer.`
**Click 7 (1:20):** `Generate design` [ANTICIPATED]. Point at the interpretation badge (`Demo rules mode`).
**Click 8 (1:30):** Point at the reuse decisions: **Source Selector = REUSE**, **Classroom Preview = ADAPT**, each with its reason.
**Click 9 (1:40):** Open the **Preview**. Choose the **Student** role.
**Click 10 (1:48):** Focus **Professor**, then **Whiteboard**, then **Slides**.

> **Jash:** "A customer describes what they need in plain language. The system turns it into structured requirements, and the badge tells you honestly that this is rules mode, not a language model. It then matches against the library. The source selector is reused as-is, and the lecture preview is adapted.
>
> This is the generated university app. Professor and Whiteboard are two processed views from **one** physical classroom camera. Slides is a separate digital source. A student can pick a view, change layout, go full screen…"

**Click 11 (1:58):** Show that the student has **no camera-control (PTZ)** control. If a Professor role switch is available, show that PTZ appears only there.

> **Vani (2:00):** "…and a student can't steer the professor's camera. That permission decision came from the design, not from someone remembering it."

### 2:05–3:05 · The next-day change: 3 → 4 views (Jash, with Vani framing) ★ main moment

> **Vani (2:05):** "Here's the scenario that costs real time today. The professor emails: *tomorrow is a lab.*"

**Click 12 (2:10):** In the Architect or the change-request input, the lab request is pre-filled:
`Tomorrow is a lab. Add a Workbench camera, let students choose four views, and keep Lecture mode unchanged.`
**Click 13 (2:15):** `Apply change` [ANTICIPATED]. The **Workbench** feed enters the layout, and the preview now has **four** selectable views.
**Click 14 (2:28):** Switch mode to **Laboratory**. Select **Workbench**.
**Click 15 (2:38):** Switch mode back to **Lecture**. The original three views are unchanged.
**Click 16 (2:46):** Toggle **Before / After**. Point at the diff: `workbench-camera` added, `workbench` added, `laboratory` mode added, `lecture` mode **preserved**.

> **Jash:** "The system didn't swap a screenshot. It produced a **new validated configuration**: a second physical camera, a fourth processed view, and a new Laboratory mode. The preview re-renders from that object.
>
> And Lecture mode is still exactly what was approved yesterday. The diff is computed from the two configurations: added, added, added, **preserved**."

> **Vani (3:00):** "That's the point: change one thing without rebuilding everything else."

### 3:05–4:05 · DNA X-Ray: provenance (Jash)

**Click 17 (3:07):** Toggle **DNA X-Ray** [ANTICIPATED] over the Laboratory preview.
**Click 18 (3:15):** Click the **Source Selector** region. The inspector shows: REUSE · sample `classroom` · `src/sample-apps/classroom/SourceSelector.tsx` · reason · proposed layer Edge · verification item.
**Click 19 (3:30):** Click the **Workbench** region. The inspector shows: NEW · no source sample · proposed Camera + Hub · "Confirm camera placement and workbench coverage."
**Click 20 (3:45, optional, only if ahead of time):** Show the hidden-view request and the `no-line-of-sight` review warning.
**Click 21 (3:58):** `Esc` closes X-Ray.

> **Jash:** "X-Ray answers the question an engineer asks first: *where did this come from?* This selector is reused from the Classroom sample. Here's the file and the reason. The Workbench is new. The system says so, and it flags what a human must verify: camera placement and coverage."
>
> *(Optional)* "If someone asks for a view a camera physically can't see, the system doesn't fake it. It raises a review warning."

Be honest about the optional coverage check. The line-of-sight fact is **supplied in the request fixture**, not computed from room geometry. Say "the request declares no line of sight, and the system refuses to fake the view", not "the system computed visibility".

### 4:05–4:45 · Blueprint and human approval (Jash, then Vani)

**Click 22 (4:07):** Go to **Blueprint**. Point at Camera / Hub / Edge, each marked **Proposed · Unverified**.
**Click 23 (4:15):** Point at assumptions and the engineering sign-off checklist.
**Click 24 (4:22):** `Approve design` [ANTICIPATED].
**Click 25 (4:28):** Go to **Library**. Reload the page (`F5`). The approved recipe is still listed.

> **Jash:** "The blueprint uses the **same configuration** you saw in the preview and the X-Ray. Every Camera, Hub, and Edge responsibility is a *proposal* that Canon engineering must verify. Nothing ships without this approval step.
>
> Approve, and the design becomes a recipe in the library. It's still there after a reload."

> **Vani (4:38):** "So the next customer doesn't start from zero. They start from this."

### 4:45–5:00 · Close (Vani · final slide)

**Click 26 (4:45):** Vani advances to the final slide (ask / roadmap).

> **Vani:** "Today this is one worked example, with team-built samples and a human approving every step. Next, we'd validate it on authorized Canon applications against the real SDK, and measure whether it moves the three months toward three weeks.
>
> Canon has built the technology that transforms how people see. Canon DNA transforms how the applications built on it are made. Thank you."

---

## Timing buffer rules

- **Ahead at 3:05:** run the optional coverage warning (Click 20).
- **Behind at 2:05:** skip Click 11 (PTZ) and Click 4 (second node).
- **Behind at 3:05:** X-Ray gets only Workbench (Click 19). Skip Source Selector.
- **Behind at 4:05:** skip the reload (Click 25). Say "it persists across reloads".
- **Hard stop:** Vani starts the close at **4:45 no matter what**.

## Failure lines (no apologies, just keep moving)

- **UI error or freeze:** Vani: "Let's look at the captured run." She switches to the backup screenshots or video (`docs/demo-runbook.md` → Fallback).
- **Generate does nothing:** Jash: "Rules mode only accepts the exact supplied request. Here's the prepared one." Re-paste it from the runbook, or go to the fallback.
- **Deployed URL down:** switch to the local production build (runbook §Network fallback).

---

## Three-minute Q&A crib sheet

Keep answers to 20–30 seconds. Lead with the honest boundary, then the path forward.

**1. "Isn't this just template lookup? Where is the AI?"**
- Today's demo runs in disclosed **rules mode**: fixed, validated interpretation of the supplied requests. We chose that so the demo is deterministic and honest.
- The AI layer's job is the step that's hard for templates: turn messy customer language into **structured, schema-validated requirements**, then rank and explain reuse across many prior apps. Its output is data checked against a schema (Zod), never executable code.
- What makes the design hold up is that every AI decision can be checked: provenance, REUSE/ADAPT/NEW with a reason, and human approval.

**2. "How does this fit the AMLOS SDK?"**
- We had no SDK, test environment, or credentials this weekend. Every Camera/Hub/Edge mapping is labelled **proposed and unverified**.
- Our proposed split follows the briefing: Camera = capture, processing, and PTZ; Hub = aggregation and distribution of views and media; Edge = browser UI hosting.
- In the next phase, a Canon engineer would review each mapping against the real SDK before the blueprint can be approved.

**3. "What's real and what's simulated?"**
- **Real:** sample React components and their manifests; the configuration engine; validation; the 3→4 view change computed as a new config; the diff; provenance; the approval flow; local persistence.
- **Simulated:** camera and media feeds (labelled), the AMLOS mappings (proposed), and the sample applications themselves (team-created stand-ins for Canon's prior work).
- **Not built:** SDK integration, a real LLM (unless shown), and source parsing beyond manifests.

**4. "Privacy and source protection? Would you ingest our code?"**
- This weekend: no Canon code, customer data, or credentials anywhere in the repo.
- Real deployment: extraction runs only on **authorized** applications, inside Canon's environment. The library stores component recipes and provenance, not customer media. Every reuse is traceable to its origin, so it can be audited or revoked.

**5. "How much reuse is there really? How would you validate it?"**
- We **don't know yet** and won't claim a number. Our two samples show the mechanism, not the rate.
- Validation plan: interview integrators, take a few past Canon customizations, measure how many components were truly re-derived, then compare design time and reviewer effort with and without Canon DNA.

**6. "IP / what happens if you continue?"**
- Our understanding of the briefing is that hackathon ideas are treated as open and non-confidential, and a separate agreement follows for continuing teams. We'd review those terms before any commitment.
- Continuing phase: authorized source extraction → SDK prototype on Canon's infrastructure → measured evaluation (see the roadmap slide).

**Fallback for any unknown:** "That's something we'd validate with Canon engineering. We didn't want to guess on stage."
