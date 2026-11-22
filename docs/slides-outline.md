# Canon DNA — slide deck outline (7-slide PDF)

**Owner:** Vani (narrative and visuals). QA maintains this checklist.
**Deadline:** PDF exported and submitted **before Sunday Nov 22, 2026, 12:00 PM ET**. Target 11:00 AM.
**Format:** 16:9, black/red/white per `DESIGN.md` (canvas `#09090B`, red `#E21C2A`, white `#F5F5F7`, silver `#A4A4AB`). Geist or Inter. At most 25 words of body text per slide. Speaker detail lives in `docs/pitch-outline.md`.

## Screenshot rules

- **No screenshots exist yet.** None may be mocked up, drawn, or taken from another product. Each slot below names a *future* capture from the integrated app. Until it exists, leave a labelled grey placeholder box (`SCREENSHOT PENDING: S-xx`).
- Capture at **1440×900**, device scale 2 if possible, from a **fresh** browser profile after the demo-state reset (`docs/demo-runbook.md`).
- Every capture must show the `SIMULATED SOURCE` labels and the `Independent hackathon concept for Canon AMLOS` subtitle wherever the UI displays them. Do not crop them out.
- Name each file `S-xx-<stage>.png` and store it outside the repo or in the team Drive. Do not commit screenshots without Jash's approval.
- The planned Playwright run (`tests/e2e/browser/demo-path.e2e.ts`) saves matching stage screenshots. Use those as raw material only after a human has checked them.

| ID | Capture (after integration) | Used on |
|---|---|---|
| S-01 | Library: both sample tiles with real manifest counts and the team-created label | Slide 3 |
| S-02 | Extraction: graph with the Source Selector inspector open, source path visible | Slide 3 |
| S-03 | Architect: lecture prompt, `Demo rules mode` badge, REUSE + ADAPT decisions with reasons | Slide 4 |
| S-04 | Preview, Lecture mode, Student role: 3 views (Professor, Whiteboard, Slides) | Slide 4 |
| S-05 | Preview, Laboratory mode: 4 views with Workbench visible | Slide 5 |
| S-06 | Before/After comparison: diff list showing added ×3 and Lecture **preserved** | Slide 5 |
| S-07 | DNA X-Ray: inspector open on the Workbench (NEW) or Source Selector (REUSE) component | Slide 6 |
| S-08 | Blueprint: Camera/Hub/Edge proposed + unverified, sign-off checklist | Slide 6 |
| S-09 | Library after reload: approved recipe visible | Slide 7 |

---

## Slide 1 — Title

- **Headline:** CANON DNA
- **Sub:** "Every approved application becomes intelligence for the next."
- **Footer:** Jash · Vani · Brampton AI Innovator Hackathon · Canon Canada Challenge 1 · *Independent hackathon concept for Canon AMLOS*
- **Visual:** none, or a restrained typographic DNA motif. No screenshot.

## Slide 2 — The problem

- **Headline:** "Every custom AMLOS application starts from zero."
- **Three beats:**
  1. Customization takes about **3 months** today.
  2. Canon's target is about **3 weeks**.
  3. Prior approved decisions (views, permissions, layouts) are re-derived each time.
- **Visual:** a simple timeline bar, 3 months versus a dashed 3-week *target*. Label the target clearly as a **goal**, not a result.
- **No screenshot.**
- **Claim check:** no "we achieved / we measured" language.

## Slide 3 — Existing work → reusable DNA

- **Headline:** "Start from what already exists."
- **Body:** Team-created sample apps → manifest-backed extraction → components with real source paths and dependencies.
- **Screenshots:** **S-01** (left, small) + **S-02** (right, dominant).
- **Caption:** "Team-created sample applications. No Canon source used."

## Slide 4 — Customer request → three-view app

- **Headline:** "Describe it. Get a validated design."
- **Body:** Plain-language request → structured requirements → REUSE / ADAPT / NEW with reasons.
- **Callout:** "Professor + Whiteboard: one physical camera. Slides: digital source."
- **Screenshots:** **S-03** (top strip) + **S-04** (dominant).
- **Honesty tag:** if the demo runs in rules mode, the badge in S-03 must read rules/demo mode. Do not caption it "AI generated".

## Slide 5 — The next-day change: 3 → 4 views ★

- **Headline:** "Tomorrow is a lab."
- **Body:** Add a Workbench camera → new Laboratory mode with four views → Lecture mode **unchanged**.
- **Screenshots:** **S-05** (dominant) + **S-06** (inset diff).
- **Callout:** "New configuration, not a screenshot swap. Lecture preserved."

## Slide 6 — DNA X-Ray and proposed AMLOS architecture

- **Headline:** "Know where every part came from."
- **Left:** **S-07**. Provenance shows REUSE/ADAPT/NEW, source file, reason, and verification needed.
- **Right:** **S-08**, or a simple three-box diagram drawn from the S-08 content:
  - **Camera:** capture, processing, PTZ *(proposed)*
  - **Hub:** aggregate and distribute views and media *(proposed)*
  - **Edge:** host browser UI *(proposed)*
- **Mandatory label:** "Proposed mapping · engineering verification required · no SDK integration this weekend."

## Slide 7 — Human approval, roadmap, ask

- **Headline:** "Humans approve. The library grows."
- **Left:** **S-09**, the approved recipe in the Library after reload.
- **Roadmap (right), four steps from execution plan §12:**
  1. Validate with Canon and integrators. Measure current customization effort.
  2. Authorized extraction from approved Canon applications.
  3. SDK prototype on Camera / Hub / Edge.
  4. Evaluate time-to-design, correctness, and reviewer effort.
- **Ask:** "Continue with Canon to validate on real applications."
- **Closing line:** "Canon transforms how people see. Canon DNA transforms how the applications behind it are built."

### Optional slide 7b — Honest limitations (only if Q&A prep shows a need, or the judges want it)

- Sample apps are team-created. Media is simulated. Interpretation runs in rules mode. Mappings are proposed and unverified. Persistence is local only. No measured time savings yet.

---

## Pre-export checklist

- [ ] All 9 screenshot slots filled with real captures from the integrated build, or the slot is removed. No placeholders in the submitted PDF.
- [ ] No "official Canon product" implication. The Canon name appears only as the challenge host and AMLOS platform reference.
- [ ] No VR, XR, quantum, 3D-room, or generic AI-buzzword imagery.
- [ ] Every number on a slide is either Canon's own framing (3 months / 3 weeks target) or a real count read from the app.
- [ ] "Proposed / unverified" visible on slide 6. "Simulated" visible somewhere in slides 4–5.
- [ ] Text legible at projector distance: body ≥ 24 pt, captions ≥ 16 pt.
- [ ] PDF opens on a second machine. File name `CanonDNA_Pitch.pdf`. Size under the submission limit.
- [ ] Submitted, and the submission confirmation captured, before 12:00 PM ET.
