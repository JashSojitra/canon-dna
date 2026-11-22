# CANON DNA — premium interface & motion design direction

This supersedes the old cyan/blue design language in the original brainstorming brief. Canon DNA must feel like a premium **precision instrument for engineering**, not an Awwwards landing-page demo, a glassmorphism toy, or a generic CRUD dashboard.

## Canon DNA visual foundation
- Canvas `#09090B`, surface `#121215`, raised surface `#1B1B1F`.
- Signature red `#E21C2A` (red is for primary active/focal actions), white `#F5F5F7`, muted silver `#A4A4AB`, hairline white/8–12% borders.
- Red is not a glow around everything. No blue/cyan accent theme. No green decoration. REUSE/ADAPT/NEW are labelled with text and distinct symbols/hatch/border styles; semantic warning colors are permissible only when essential for comprehension.
- Typography: crisp display typography with tight heading tracking, readable small text, judicious mono technical identifiers. Use Geist or Inter with local/system fallback.
- Apple-inspired material hierarchy: glass for nav/toolbars, command palette, and contextual inspector only; solid opaque surfaces for dense data, source code and live camera previews. Make glass text readable against all backgrounds.
- Strong grid, 8pt spacing rhythm, deliberate negative space. Visual emphasis on useful information; one focal animation at a time. Keep animation mostly 150–300ms; fluid interruptible Motion springs for controls; `prefers-reduced-motion` support. Never block interaction behind theatrical loading.
- Main UX = one continuous studio with five navigable stages. The preview should dominate the viewport. No oversized landing hero when engineers need to work. DNA X-Ray is the primary signature transition; lab 3->4 change the second.

## Sources to use (inspect current component docs and their licensing before copying)
1. **Apple Design skill** — https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md ; optional CLI `npx skills add emilkowalski/skills --skill apple-design`. Prioritize fluid, reversible interactions, translucency conveying hierarchy, accessible contrast and reduced-motion behaviour.
2. **User Interface Wiki** — https://github.com/raphaelsalaja/userinterface-wiki/blob/main/skills/SKILL.md ; optional `npx skills add raphaelsalaja/userinterface-wiki`. Useful for optical typography, motion timing, layout, interactive targets, accessible states.
3. **Componentry** — https://componentry.dev/docs ; editable shadcn-compatible React components. Consider a restrained `layered-stack` for library entries, subtle cards and text effects. Install ONE component only if it is directly useful and doesn't disrupt state ownership.
4. **Skiper UI** — https://skiper-ui.com/ ; shadcn-ready components. Consider its Dynamic Island or input behaviours for the Architect action area; do not copy an entire ornamental landing page. Verify attribution requirements: free version needs attribution.
5. **Animmaster Lib** — https://animmasterlib.dev/ ; browse for transition inspiration. Many components come in paid source packs and are plain HTML/CSS/JS rather than Next.js components. Avoid dependency churn and do not rely on paid assets we have not purchased.
6. **ThreeUI** — https://threeui.com/browse ; visual reference for tasteful orbital/connection motifs. Use a lightweight CSS/SVG/React Flow DNA graphic instead of a heavy WebGL hero unless performance testing justifies WebGL. Review license/source availability per asset.

## Target components and motion (in order)
- Library: two editorial sample project tiles with restrained depth, direct Analyze action and real manifest counts.
- Extraction: animated *real* dependency graph reveals; click node opens a sharp glass-edged inspector with actual sample source path; never fake parsing.
- Architect: striking but readable large input, structured requirement chips, clear real-LLM vs rules-demo indicator, reuse classifications with rationales.
- Live Preview: high-fidelity student/professor screens with working view focus, layout change and mode switch; use local simulated feed posters/clips. This is the largest part of the canvas.
- Lab delta: fourth Workbench feed physically inserts in layout; smart diff and reversible Before/After; no screenshot swaps.
- DNA X-Ray: subtle background dim, component silhouettes/wireframes, lineage connector traces and right inspector. Inspectable focus, keyboard escapable; avoid illegible colors/overlapping overlays.
- Approval: explicit proposed Camera/Hub/Edge responsibilities, validation checks, engineer signoff, satisfying insertion of approved recipe into library.

## Review criteria
1. Will the judge understand the change within 3 seconds?
2. Are all controls operable without waiting for motion?
3. Does a 1440px projected screen show crisp text and unmistakable states?
4. Are 390px/768px layouts functional with reasonable tap targets?
5. Is the same underlying app configuration visible in preview, X-Ray and blueprint?
6. Can a reduced-motion / no-WebGL / offline user complete the demo?

## Assets and sourcing
No unreleased Canon code, customer data or private material in repo. Use official supplied brief solely as design reference; do not copy Canon's trademarks into a fake product identity. App subtitle should clearly state `Independent hackathon concept for Canon AMLOS`. Do not bundle fonts whose licenses you have not checked or copy premium UI source without a license.
