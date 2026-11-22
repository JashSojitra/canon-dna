"use client";

import Link from "next/link";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "motion/react";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Dna, FileCheck, GitBranch, Library, Monitor, Plus, SlidersHorizontal, X } from "lucide-react";
import { sampleApps } from "@/data/sample-apps";
import { lecturePrompt, labPrompt, lectureRequirements, hiddenViewRequest } from "@/data/demo-prompts";
import { applyLabRequirement, buildLectureApp, composeBlueprint, diffApps, extractSampleDNA, interpretRequirements, matchReusableComponents, validateCoverage } from "@/lib/engine";
import { approvedRecipeSchema, generatedAppSchema, type ApprovedRecipe, type GeneratedApp, type Lineage } from "@/types/canon-dna";
import { readRecipes, saveRecipe } from "@/store/recipes";
import { FeedArt } from "./feed-art";
import { AppPreview } from "./app-preview";
import { laboratoryApp } from "@/data/demo-apps";
import { ReuseWorkshop, TopologyCanvas, AssemblyScene, componentName } from "./v5-experience";
import v5 from "./v5.module.css";

// Presentation only: validate immediately, then replay facts → decisions → composed design.
const ASSEMBLY_TIMING = { decisions: 750, composition: 1900, complete: 3400 };
const stages = ["Examples", "Inspect DNA", "Draft design", "Preview & evolve", "Review & approve"];
const stageIds = ["library", "extraction", "architect", "preview", "blueprint"];
const symbols = [Library, GitBranch, SlidersHorizontal, Monitor, FileCheck];
function Button({ children, onClick, primary = false, disabled = false, testId }: { children: ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean; testId?: string }) {
  return <button data-testid={testId} className={`button ${primary ? "primary" : ""}`} onClick={onClick} disabled={disabled}>{children}</button>;
}
export function Kind({ kind }: { kind: Lineage["kind"] }) {
  return <span className={`kind kind-${kind}`}>{kind === "reuse" ? <ArrowUpRight /> : kind === "adapt" ? <SlidersHorizontal /> : <Plus />} {kind}</span>;
}
export function LineageInspector({ entry, app, onSelect }: { entry: Lineage; app: GeneratedApp; onSelect: (id: string) => void }) {
  return <aside className="inspector" data-testid="inspector-panel"><div className="eyebrow">COMPONENT INSPECTOR</div><Kind kind={entry.kind} /><h3>{componentName(entry.componentId)}</h3><p>{entry.reason}</p><dl><dt>Origin</dt><dd>{entry.sampleProjectId ? sampleApps.find(s => s.id === entry.sampleProjectId)?.name ?? entry.sampleProjectId : "New requirement · no sample origin"}</dd><dt>Source path</dt><dd><code>{entry.sourceFile ?? "New design · implementation pending"}</code></dd><dt>Related views</dt><dd>{entry.appliesTo?.sourceIds.map(id => app.sources.find(source => source.id === id)?.label ?? id).join(" / ") || "Shared presentation component"}</dd><dt>Dependencies</dt><dd>{entry.dependencies.length ? entry.dependencies.map(id => <button key={id} className="text-button" onClick={() => onSelect(id)} disabled={!app.lineage.some(l => l.componentId === id)}>{id} ↗</button>) : "No declared dependencies"}</dd><dt>Proposed responsibility</dt><dd>{entry.proposedAmlosLayers.join(" / ")} <span className="muted">· UNVERIFIED</span></dd></dl><div className="review-note"><span className="eyebrow">ENGINEERING VERIFICATION</span>{entry.verificationRequired.map(item => <p key={item}>{item}</p>)}</div></aside>;
}

export function Studio() {
  const [stage, setStage] = useState(0);
  const reduced = useReducedMotion();
  const [prepared, setPrepared] = useState<GeneratedApp | null>(null);
  const [act, setAct] = useState(0);
  const [replay, setReplay] = useState(false);
  const [projectId, setProjectId] = useState(sampleApps[0].id);
  const [nodeId, setNodeId] = useState("");
  const [prompt, setPrompt] = useState(lecturePrompt);
  const [institution, setInstitution] = useState(lectureRequirements.institution);
  const [title, setTitle] = useState(lectureRequirements.title);
  const [structured, setStructured] = useState(false);
  const [app, setApp] = useState<GeneratedApp | null>(null);
  const [before, setBefore] = useState<GeneratedApp | null>(null);
  const [showBefore, setShowBefore] = useState(false);
  const [lab, setLab] = useState(labPrompt);
  const [recipes, setRecipes] = useState<ApprovedRecipe[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [engineer, setEngineer] = useState("");
  const [reviewed, setReviewed] = useState<string[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    function syncRecipes() {
      try { setRecipes(readRecipes()); } catch { setError("Local library is unavailable or contains invalid data. Existing saved data has been preserved."); }
    }
    const timer = window.setTimeout(() => { syncRecipes(); const requested = new URLSearchParams(window.location.search).get("stage"); if (["architect", "preview", "blueprint"].includes(requested ?? "")) { setStage(2); if (requested !== "architect") setNotice(`First generate a classroom draft. Then ${requested === "preview" ? "preview it and add the lab update" : "review its blueprint for approval"}.`); } }, 0);
    window.addEventListener("storage", syncRecipes);
    return () => { window.clearTimeout(timer); window.removeEventListener("storage", syncRecipes); };
  }, []);
  function navigate(next: number) { setPrepared(null); setStage(next); setError(""); requestAnimationFrame(() => heading.current?.focus()); }
  function run(action: () => void) { setError(""); setNotice(""); try { action(); } catch (e) { setError(e instanceof Error ? e.message : "The action failed. Please try again."); } }
  function analyze(id: string) { setProjectId(id); const dna = extractSampleDNA(id); setNodeId(dna?.project.components.find(c => c.id === "source-selector")?.id ?? dna?.project.components[0]?.id ?? ""); navigate(1); }
  function generate() { run(() => {
    const result = interpretRequirements(prompt, structured ? { kind: "lecture", institution, title } : undefined);
    if (!result.ok) throw new Error(result.message);
    if (result.requirements.kind !== "lecture") throw new Error("Generate a lecture first. Apply laboratory changes in Live Preview.");
    const next = generatedAppSchema.parse(buildLectureApp(result.requirements, matchReusableComponents(result.requirements, sampleApps)));
    if (reduced) finishGeneration(next);
    else { setAct(0); setReplay(false); setPrepared(next); }
  }); }
  function finishGeneration(next: GeneratedApp) {
    setApp(next); setBefore(null); setShowBefore(false); setReviewed([]);
    setNotice("Validated lecture design generated using demo rules."); navigate(3);
  }
  useEffect(() => {
    if (!prepared || replay) return;
    const timers = [window.setTimeout(() => setAct(1), 550), window.setTimeout(() => setAct(2), 1100), window.setTimeout(() => {
      setApp(prepared); setBefore(null); setShowBefore(false); setReviewed([]); setPrepared(null);
      setNotice("Validated lecture design generated using demo rules."); setStage(replay ? 2 : 3);
      requestAnimationFrame(() => heading.current?.focus());
    }, ASSEMBLY_TIMING.complete)];
    return () => timers.forEach(window.clearTimeout);
  }, [prepared, replay]);
  function updateLab() { if (!app) return; run(() => {
    const next = generatedAppSchema.parse(applyLabRequirement(app, lab));
    if (!before && !app.modes.laboratory) setBefore(structuredClone(app));
    setApp(next); setShowBefore(false); setReviewed([]); setNotice("Laboratory added. Lecture configuration preserved.");
  }); }
  function approve() { if (!app) return; run(() => {
    if (!engineer.trim()) throw new Error("Enter the reviewing engineer’s name.");
    const recipe = approvedRecipeSchema.parse({ id: `recipe-${app.id}`, app: { ...app, approval: "approved" }, approvedBy: engineer.trim(), approvedAt: new Date().toISOString() });
    setRecipes(saveRecipe(recipe)); setApp(recipe.app); navigate(0); setNotice("Recipe approved and saved to this browser’s DNA Library. Hardware mappings remain unverified.");
  }); }
  const dna = extractSampleDNA(projectId);
  const visibleApp = showBefore && before ? before : app;
  const blueprint = app ? composeBlueprint(app) : null;
  const diff = before && app ? diffApps(before, app) : [];

  return <div className={`studio ${v5.studio}`}><a className="skip-link" href="#workspace">Skip to workspace</a>
    <aside className="sidebar"><button className="brand" onClick={() => navigate(0)} aria-label="Canon DNA library"><span className="brand-mark"><Dna /></span><span>CANON <b>DNA</b><small>APPLICATION RECIPES</small></span></button>
      <Link className="overview-link" href="/"><ArrowLeft /> Back to overview</Link><LayoutGroup id="studio-navigation"><nav aria-label="Studio stages">{stages.map((name, i) => <button data-testid={`stage-nav-${stageIds[i]}`} key={name} aria-current={stage === i ? "step" : undefined} disabled={i >= 3 && !app} className={`nav-item ${stage === i ? "active" : ""}`} onClick={() => navigate(i)}>{stage === i && <motion.span className="stage-laser" layoutId={reduced ? undefined : "active-stage"} transition={{ duration: reduced ? 0 : .28 }} />}<span className="nav-symbol">{(() => { const Icon = symbols[i]; return <Icon />; })()}</span>{name}<span className="step-number">0{i + 1}</span></button>)}</nav></LayoutGroup>
      <div className="sidebar-bottom"><div className="local-status"><span /> LOCAL DEMO ENVIRONMENT</div><p>Built from team-created samples.<br />Designed for human approval.</p><span className="version">CANON DNA / CONCEPT 01</span></div>
    </aside>
    <div className="studio-body"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span><strong>{stages[stage]}</strong></div><div className="topbar-right"><span className="step-context">Step {stage + 1} of {stages.length}</span></div></header>
      <main id="workspace" data-stage={stageIds[stage]}><div className="page-heading"><div><h1 ref={heading} tabIndex={-1}>{[
          "Start with engineering you already have",
          "See old engineering become a new experience",
          "Describe the new classroom",
          app?.modes.laboratory ? "One new camera. A fourth view. Lecture preserved." : "A classroom with three selectable views",
          "Review the design before it becomes reusable",
        ][stage]}</h1><p className="intro">{[
          "Explore two team-created sample apps, then inspect the parts you can reuse.",
          "Compare real sample components with their proposed use in a new classroom design.",
          "Use the supplied request or structured fields to draft a traceable application recipe.",
          "Choose a view, add the lab requirement, then use DNA X-Ray to inspect where each part came from.",
          "Review camera routes, proposed AMLOS responsibilities, and open verification points before signoff.",
        ][stage]}</p></div></div>
        {error && <div className="message error" data-testid="architect-error" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss error"><X /></button></div>}
        {notice && <div className="message" role="status"><Check /> {notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification"><X /></button></div>}

        <AnimatePresence mode="wait" initial={false}><motion.div key={stage} className="stage-content" initial={reduced ? false : { opacity: 0, y: 16, filter: "blur(3px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : -10, filter: reduced ? "blur(0px)" : "blur(3px)", transition: { duration: reduced ? 0 : .16 } }} transition={{ duration: reduced ? 0 : .3 }} onAnimationComplete={() => { if (document.activeElement === document.body) heading.current?.focus(); }}>
        {stage === 0 && <><div className="section-heading"><h2>DNA Library <span>{sampleApps.length + recipes.length}</span></h2><span className="muted">Choose an example to begin</span></div><div className="library-grid">{sampleApps.map((sample, i) => <article className="project-card" data-testid={`library-sample-${sample.id}`} key={sample.id}><div className={`project-art project-art-${i}`}><div className="art-header"><span>AMLOS / SAMPLE 0{i + 1}</span><span>↗</span></div><div className="mini-app"><div className="mini-toolbar"><span /><span /><span /><b>{i === 0 ? "CLASSROOM / LECTURE" : "TRAINING / GUIDED SESSION"}</b></div><div className="mini-feeds"><FeedArt id={i === 0 ? "professor" : "workbench"} label={sample.name} /><div><FeedArt id="whiteboard" label="Whiteboard" /><FeedArt id="slides" label="Slides" /></div></div><div className="mini-footer">{sample.components.map(c => <span key={c.id}>{c.name}</span>)}</div></div><span className="art-caption">TEAM-CREATED REACT APPLICATION</span></div><div className="project-info"><div className="eyebrow">{sample.origin} SAMPLE</div><h3>{sample.name}</h3><p>{sample.components.map(c => c.capabilities.join(", ").replaceAll("-", " ")).join(" · ")}</p><div className="project-bottom"><div><strong>{sample.components.length}</strong> components <span>·</span> <strong>{sample.dependencies.length}</strong> dependency</div><Button primary={i === 0} testId={`analyze-dna-${sample.id}`} onClick={() => analyze(sample.id)}>Inspect DNA <ArrowRight /></Button></div></div></article>)}</div>
          {recipes.length > 0 && <section className="saved-recipes" data-testid="library-recipes"><div className="section-heading"><h2>Approved recipes <span>{recipes.length}</span></h2><span className="muted">Saved in this browser</span></div>{recipes.map(recipe => <article data-testid={`library-recipe-${recipe.id}`} key={recipe.id} className="recipe-row"><FileCheck className="recipe-icon" /><div><h3>{recipe.app.title}</h3><p>{recipe.app.institution} · Approved by {recipe.approvedBy} · {new Date(recipe.approvedAt).toLocaleDateString()}</p></div><Button onClick={() => { setApp(generatedAppSchema.parse(recipe.app)); setBefore(null); setShowBefore(false); setReviewed([]); navigate(3); }}>Open recipe <ArrowUpRight /></Button></article>)}</section>}
          <div className="library-footnote"><GitBranch className="line-icon" /><div><h3>Intelligence with a paper trail.</h3><p>Manifest-backed analysis of authorized samples. No private Canon code. No hardware connection.</p></div><span className="mono">SOURCE → RECIPE → REUSE</span></div></>}

        {stage === 1 && dna && <><div className="section-heading"><div><h2>{dna.project.name}</h2><p className="muted">{dna.method} · {dna.project.components.length} components · {dna.project.dependencies.length} dependency</p></div><Button primary onClick={() => navigate(2)}>Draft a new design <ArrowRight /></Button></div><ReuseWorkshop app={app ?? laboratoryApp} projectId={projectId} selectedId={nodeId} onSelect={setNodeId} /><details className={v5.technical}><summary>Manifest dependencies · {dna.project.dependencies.length} declared links</summary>{dna.project.dependencies.map(edge => <button className="text-button" data-testid={`dna-edge-${edge.from}--${edge.to}`} key={`${edge.from}-${edge.to}`} onClick={() => setNodeId(edge.from)}>{edge.from} → {edge.to}</button>)}<p>Manifest read only. Not AST analysis or a scan of Canon repositories.</p></details></>}

        {stage === 2 && <><div className="architect-layout" hidden={Boolean(prepared)}><section className="prompt-panel"><div className="section-heading"><h2>What are we building?</h2><span className="rules-badge" data-testid="interpretation-mode">Guided rules demo · not live AI</span></div><label htmlFor="requirements" className="sr-only">Application requirements</label><textarea data-testid="architect-input" id="requirements" value={prompt} onChange={e => setPrompt(e.target.value)} rows={6} /><div className="prompt-actions"><button className="text-button" onClick={() => { setPrompt(lecturePrompt); setStructured(false); }}>Use university demo prompt</button><span className="mono">{prompt.length} characters</span></div><label className="check-row"><input name="structured-lecture" type="checkbox" checked={structured} onChange={e => setStructured(e.target.checked)} />Use structured lecture requirements</label>{structured && <div className="form-grid"><label>Institution<input name="institution" value={institution} onChange={e => setInstitution(e.target.value)} /></label><label>Application name<input name="application-title" value={title} onChange={e => setTitle(e.target.value)} /></label></div>}<p className="muted small">Demo rules recognize the supplied prompt. For a custom name and institution, use structured lecture requirements. General language interpretation and real AI are not connected.</p><div className="prompt-submit"><span>Validated data. No generated code.</span><Button primary disabled={Boolean(prepared)} testId="architect-generate" onClick={generate}>Generate design <ArrowRight /></Button></div></section><aside className="architect-aside"><span className="eyebrow">THE DESIGN BRIEF</span><h3>One classroom.<br />Three perspectives.</h3><div className="brief-row"><b>01</b><div>One physical camera<small>Professor + Whiteboard processed views</small></div></div><div className="brief-row"><b>02</b><div>A digital slides source<small>Independent of camera capture</small></div></div><div className="brief-row"><b>03</b><div>Two distinct roles<small>Professor controls. Student chooses a view.</small></div></div><div className="review-note">Matching uses both team-created manifests where capabilities apply. All AMLOS mappings remain proposed.</div></aside></div>{prepared && <section className="generation-film" data-testid="generation-sequence" aria-label="Design assembly presentation"><div className="generation-top"><span className="eyebrow">GUIDED RULES DEMO / NOT LIVE AI</span><button className="text-button" onClick={() => finishGeneration(prepared)}>Skip animation <ArrowRight /></button></div><div className={v5.replayControls}>{["Grounded facts", "Reuse decisions", "Composed design"].map((label, index) => <button key={label} aria-pressed={act === index} onClick={() => { setReplay(true); setAct(index); }}>{label}</button>)}</div><p className="muted">Results computed and validated. Presenting how this recipe fits together.</p><div className="generation-acts">{["Interpreting request", "Finding reusable parts", "Assembling design"].map((label, index) => <div key={label} data-active={act === index} data-complete={act > index}><span>0{index + 1}</span><strong>{label}</strong></div>)}</div><AnimatePresence mode="wait"><motion.div key={act} initial={reduced ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .2 }}><AssemblyScene app={prepared} act={act} /></motion.div></AnimatePresence></section>}{app && <><Button onClick={() => { setReplay(true); setAct(0); setPrepared(app); }}>Replay design assembly <ArrowRight /></Button><ReuseReview app={app} /></>}</>}

        {stage === 3 && app && visibleApp && <><div className="section-heading preview-heading"><div className="segment">{before ? <><button data-testid="before-after-toggle" aria-pressed={showBefore} onClick={() => setShowBefore(true)}>Before / Lecture</button><button aria-pressed={!showBefore} onClick={() => setShowBefore(false)}>After / Updated</button></> : <span className="mono">VALIDATED APPLICATION / {app.approval.toUpperCase()}</span>}</div><Button primary={Boolean(app.modes.laboratory)} onClick={() => navigate(4)}>Review blueprint <ArrowRight /></Button></div>{before && <div className="evolution-callout" aria-label="Computed laboratory changes">{diff.filter(d => d.change === "added" && (d.entity === "source" || d.entity === "mode")).map(d => <span key={`${d.entity}-${d.id}`}>+ {d.id.replaceAll("-", " ")} {d.entity === "mode" ? "mode" : d.id.endsWith("camera") ? "" : "view"}</span>)}{diff.some(d => d.entity === "mode" && d.id === "lecture" && d.change === "preserved") && <strong><Check /> Lecture preserved</strong>}</div>}<AppPreview app={visibleApp} reportError={setError} /><ReuseReview app={visibleApp} compact />
          <section className="lab-panel"><div><span className="eyebrow">CONTROLLED EVOLUTION / NEXT-DAY REQUIREMENT</span><h2>{app.modes.laboratory ? "A new mode. The original, preserved." : "Tomorrow, the classroom becomes a lab."}</h2><label htmlFor="lab-requirements" className="sr-only">Laboratory change requirement</label><textarea data-testid="change-request-input" id="lab-requirements" rows={2} value={lab} onChange={e => setLab(e.target.value)} /><button className="text-button" onClick={() => setLab(labPrompt)}>Use supported lab prompt</button></div><Button primary={!app.modes.laboratory} testId="change-request-apply" onClick={updateLab}>{app.modes.laboratory ? "Validate lab update" : "Add laboratory mode"} <ArrowRight /></Button></section>
          {before && <section className="diff-panel" data-testid="config-diff"><div className="section-heading"><h2>Configuration delta</h2><span className="muted">Computed by diffApps · original snapshot retained</span></div><div className="delta-summary"><span><strong>{before.sources.filter(s => s.kind === "physical-camera").length} → {app.sources.filter(s => s.kind === "physical-camera").length}</strong> physical cameras</span><span><strong>{before.modes.lecture.studentSelectableIds.length} → {app.modes.laboratory?.studentSelectableIds.length}</strong> selectable views</span><span><strong>{diff.filter(d => d.change === "preserved").length}</strong> entities preserved</span></div><div className="diff-entries">{diff.filter(d => d.change !== "preserved" || d.entity === "mode").map(d => <span data-testid={`diff-${d.entity}-${d.id}`} data-change={d.change} key={`${d.entity}-${d.id}`} className={`diff-entry ${d.change}`}><b>{d.change === "added" ? "+" : d.change === "preserved" ? "=" : "~"} {d.change}</b><code>{d.entity} / {d.id}</code></span>)}</div></section>}</>}

        {stage === 4 && blueprint && app && <><div className="section-heading"><h2>{app.title} <span data-testid="approval-state">{app.approval}</span></h2><Button onClick={() => navigate(3)}><ArrowLeft /> Back to preview</Button></div><div className="blueprint-layout"><div><TopologyCanvas app={app} /><details className="detail-panel"><summary>Modes & permissions</summary>{Object.entries(app.modes).map(([id, mode]) => mode && <p key={id}><strong>{mode.label}</strong> · {mode.studentSelectableIds.map(viewId => app.sources.find(s => s.id === viewId)?.label).join(" / ")}</p>)}{Object.entries(app.roles).map(([role, permissions]) => <p key={role}><strong className="capitalize">{role}</strong><br /><code>{permissions.join(" · ")}</code></p>)}</details><details className="detail-panel"><summary>Assumptions & validation</summary>{app.assumptions.map(a => <p key={a}>↳ {a}</p>)}{app.lineage.flatMap(l => l.verificationRequired.map(v => <p key={`${l.componentId}-${v}`}>↳ {l.componentId}: {v}</p>))}<Button onClick={() => { const result = validateCoverage(hiddenViewRequest); setNotice(result.issues.map(i => `${i.message} ${i.suggestion ?? ""}`).join(" ") || "Coverage validation passed."); }}>Test hidden-side coverage constraint ↗</Button></details></div><aside className="approval-panel"><span className="eyebrow">HUMAN IN THE LOOP</span><h2>Engineering signoff.</h2><p>Approve a reusable design recipe. This does not verify SDK compatibility or authorize hardware deployment.</p><div data-testid="signoff-checklist">{blueprint.signoffChecklist.map(item => <label className="check-row" key={item}><input name={item} type="checkbox" checked={reviewed.includes(item)} onChange={e => setReviewed(e.target.checked ? [...reviewed, item] : reviewed.filter(v => v !== item))} /><span>{item}</span></label>)}</div><label className="field-label">Reviewing engineer<input name="reviewing-engineer" autoComplete="name" value={engineer} onChange={e => setEngineer(e.target.value)} placeholder="Your name" /></label><p className="small muted">Acknowledgements record prototype design review. Proposed hardware mappings remain unverified.</p><Button primary testId="approve-design" disabled={reviewed.length !== blueprint.signoffChecklist.length || !engineer.trim()} onClick={approve}>Approve design & save recipe <ArrowRight /></Button><Button onClick={() => { navigate(2); setNotice("Revise the requirements and generate a new draft. The current design remains available in Preview until replaced."); }}>Request changes</Button><p className="mono small">LOCAL STORAGE / NO SHARED DATABASE</p></aside></div></>}
        </motion.div></AnimatePresence>
      </main><footer className="studio-footer"><span data-testid="app-subtitle">Independent hackathon concept for Canon AMLOS</span><span>SIMULATED SOURCES · PROPOSED INTEGRATION</span></footer></div>
  </div>;
}

export function ReuseReview({ app, compact = false }: { app: GeneratedApp; compact?: boolean }) {
  return <details className="reuse-review" open={!compact}><summary>Why these parts? <span>{app.lineage.length} traceable decisions</span></summary><div className="reuse-decisions">{app.lineage.map(entry => <article key={entry.componentId} data-testid={`reuse-decision-${entry.componentId}`}><Kind kind={entry.kind} /><h3>{componentName(entry.componentId)}</h3><p>{entry.reason}</p><small>{sampleApps.find(sample => sample.id === entry.sampleProjectId)?.name ?? "New requirement · no sample origin"}</small></article>)}</div></details>;
}
