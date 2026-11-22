# CANON DNA — Run of Show: one GitHub repo, three agents, one integrator

This is a **human-operated**, synchronous workflow. Agents don't coordinate automatically or magically share their in-memory progress. Branches, PRs, ownership and Jash's merge approvals are the coordination mechanism.

## 0) One-time requirements
- Windows 11 machine: Git, Node.js, package manager used in repo (prefer npm for least setup), VS Code, Codex, Claude Code; GitHub signed in. Remote Dilab machine has Git and Codex.
- Create a **private** empty GitHub repository named `canon-dna` via GitHub website. Do not add a README or .gitignore when creating the remote; first commit will come from the packet.
- Copy the whole V2 packet contents into `C:\Coding Assignments\canon-dna` (or another local path). Do not copy the ZIP itself into the source repository.

**Windows PowerShell** (assumes packet was extracted into new project folder):
```powershell
cd 'C:\Coding Assignments\canon-dna'
git init -b main
git add .
git commit -m "docs: lock Canon DNA scope, roles, and premium design"
git remote add origin https://github.com/JashSojitra/canon-dna.git
git push -u origin main
```
The URL above is the planned new repo URL, not proof the repo already exists. Substitute the actual created URL if different. If a git repo already exists, DON'T `git init`; integrate docs with a normal commit instead.

## 1) Remote Dilab Codex: **bootstrap gate**
On remote Dilab:
```bash
git clone https://github.com/JashSojitra/canon-dna.git
cd canon-dna
git switch -c chore/bootstrap
```
Paste `PROMPT_REMOTE_DILAB_CODEX.md`, but **first** instruct it: “Bootstrap Next.js, TypeScript, Tailwind and exact `src/types` + `docs/contracts.md`; add sample manifest fixtures and stub engine exports, keep build green, commit and push `chore/bootstrap`, then stop and report the PR link. Do not continue engine coding yet.”

Integrate `chore/bootstrap` via GitHub pull request only after checking `docs/contracts.md`, package lockfile and `npm run build`. Then remote executes:
```bash
git switch main
git pull --ff-only origin main
git switch -c feat/dna-engine
```
Now paste remaining engine assignment and allow it to work; remote pushes engine PRs to `feat/dna-engine`. No direct main pushes. If the folder contains these Markdown instructions, do not run `create-next-app .` in place when it refuses a nonempty folder; scaffold in a temporary folder and bring the app files into this repo without overwriting instructions. Make sure remote Dilab has GitHub push access before starting.

## 2) Local Codex: a separate **working directory**
After bootstrap merge, on Windows (use the SAME initial local repo; don't clone it again):
```powershell
cd 'C:\Coding Assignments\canon-dna'
git fetch origin
git pull --ff-only origin main
git worktree add -b feat/studio-ui ..\canon-dna-ui origin/main
git worktree add -b qa/demo-audit ..\canon-dna-qa origin/main
code ..\canon-dna-ui
code ..\canon-dna-qa
```
Open **local Codex only in `canon-dna-ui`**, check `git branch --show-current` shows `feat/studio-ui`; install dependencies in this folder (`npm ci` after lockfile exists). Paste `PROMPT_LOCAL_CODEX.md` plus “Read `AGENTS.md` and `DESIGN.md` first. Do NOT edit package.json, shared types, or other owners' files.”

If source libraries need extra packages, local Codex sends the package names to Jash; remote Codex owns the dependency changes and commits them to the engine branch. Pull those changes into the UI branch after its PR is integrated.

**Optional style skill installation** from UI worktree (interactive CLI may ask which agent scope to install):
```powershell
npx skills add emilkowalski/skills --skill apple-design
npx skills add raphaelsalaja/userinterface-wiki
```
These are design instruction packs, not UI components. If the skill CLI modifies agent configuration, inspect `git status` and do not accidentally commit personal or machine-specific files. Claude can read `DESIGN.md` instead of installing the same skills again.

## 3) Claude Code: independent **QA worktree**
Open Claude Code in `C:\Coding Assignments\canon-dna-qa` only, never the UI worktree. Confirm branch `qa/demo-audit`. It can begin `docs/pitch-outline.md`, `docs/demo-script.md` and e2e test scaffolding while engine/UI build. **Wait for integrated working prototype to run final QA.** Paste `PROMPT_CLAUDE_CODE.md` and `AGENTS.md`.

## 4) How to integrate (Jash only)
1. First merge the **engine PR** once core functions are tested and contracts stable.
2. In UI worktree, merge main into UI branch, fix only UI-owned compatibility issues, then push UI PR:
```powershell
git fetch origin
git merge origin/main
npm ci
npm run build
git push -u origin feat/studio-ui
```
3. Review the UI PR, manually run lecture→lab→X-Ray→approval; merge it.
4. In QA worktree, run `git fetch origin; git merge origin/main`; QA audits integrated main, adds tests/docs, sends QA PR; merge after verifying.
5. Production Vercel deploys from `main` only. PR previews are disposable. Stop merging 45–60 minutes before the deck deadline except for critical demo blockers.

**PR creation**: after branch push, GitHub's “Compare & pull request” button is adequate. Optional GitHub CLI: `gh pr create --base main --head feat/dna-engine --fill` (and similarly for UI/QA).

## 5) Minimal communication template — every agent message to Jash
```
BRANCH:
LATEST COMMIT / PR:
CHANGED FILES:
DONE (demo-visible):
TESTS RUN / RESULTS:
BLOCKER / REQUEST FROM ANOTHER AGENT:
NEXT 1 TASK:
```
Never ask two agents to redesign the same page or rewrite the same type definitions. Jash resolves contract changes before either proceeds.

## 6) Integration checkpoints / cut rules
- Gate 0: `main` has valid scaffold + stable types + engine function signatures. Only then launch parallel UI implementation.
- Gate 1: app opens Library and reveals **truthful manifest-backed** extraction.
- Gate 2: Architect produces validated initial 3-view config; preview has working student/professor role controls.
- Gate 3: lab prompt produces **new** 4-view config, retains Lecture, updates diff/X-Ray/blueprint from the same state.
- Gate 4: approval persists recipe; full run works with no AI key, no API, no external video links.
- Gate 5: 1440px screenshots, mobile QA, 5-minute rehearsal, PDF deck exported before noon Sunday.

If Gate 2 is not stable, remove graph animation and optional LLM first. If Gate 3 is not stable, immediately stop new features and fix it. No extra shader or animations can endanger Gate 3.

## 7) Recovery procedures
- Merge conflict: STOP; identify owner; fix only under Jash's supervision. Never `git reset --hard` or `git push --force` to "solve" a teammate conflict.
- CI/build failure: revert the offending **unmerged PR** or fix in that branch; `main` always remains deployable.
- Graph/3D libraries crash: fall back to SVG graph; preserve functional extraction & provenance.
- LLM/API outage: show `Demo rules mode` truthfully; use deterministic pre-approved scenario config.
- Vercel outage: have an offline local demo running (`npm run dev` or prebuilt production server) with local media assets and screenshot/recording backup.
- Local QA worktree out of date: `git fetch origin; git merge origin/main` and run tests; do not edit UI files from QA.

## 8) How to run the evening
- Jash: sole integrator and decision maker. Only he merges PRs, handles Vercel, and checks whole-story accuracy.
- Vani: pitch slides and narrative, screenshots, 5-minute timing and projector legibility; not blocked on code because she can start with storyboard.
- Remote Dilab Codex: logic, fixtures, schemas, tests, dependency lock.
- Local Codex: visual studio, preview and interaction polish.
- Claude Code: QA and pitch, then adversarial browser tests.
- Stand-up rhythm: every 30–45 minutes ask for summary template; pick the next critical merge, don't endlessly brainstorm.
