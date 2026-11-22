"use client";

import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "motion/react";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Grid2X2, Maximize, Minus, Plus, ScanLine, Square } from "lucide-react";
import type { GeneratedApp, ModeId } from "@/types/canon-dna";
import { FeedArt } from "./feed-art";
import { Kind, LineageInspector } from "./studio";
import { componentName } from "./v5-experience";
import v5 from "./v5.module.css";

export function AppPreview({ app, reportError }: { app: GeneratedApp; reportError: (message: string) => void }) {
  const reduced = useReducedMotion();
  const hasLab = Boolean(app.modes.laboratory);
  const previousLab = useRef(hasLab);
  const [role, setRole] = useState<"professor" | "student">("student");
  const [modeId, setModeId] = useState<ModeId>(app.modes.laboratory ? "laboratory" : "lecture");
  const mode = app.modes[modeId] ?? app.modes.lecture;
  useEffect(() => {
    if (hasLab !== previousLab.current) {
      previousLab.current = hasLab;
      const timer = window.setTimeout(() => { setModeId(hasLab ? "laboratory" : "lecture"); }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [hasLab]);
  const [sceneId, setSceneId] = useState(mode.scenes[0].id);
  const scene = mode.scenes.find(s => s.id === sceneId) ?? mode.scenes[0];
  const sources = mode.studentSelectableIds.flatMap(id => {
    const source = app.sources.find(s => s.id === id);
    return source && scene.visibleSourceIds.includes(id) ? [source] : [];
  });
  const [focusId, setFocusId] = useState(sources[0]?.id ?? "");
  const focused = sources.find(s => s.id === focusId) ?? sources[0];
  const [layout, setLayout] = useState<"focus" | "grid">("focus");
  const [xray, setXray] = useState(false);
  const [selected, setSelected] = useState(app.lineage[0]?.componentId ?? "");
  const [pan, setPan] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const xrayButton = useRef<HTMLButtonElement>(null);
  const entry = app.lineage.find(l => l.componentId === selected) ?? app.lineage[0];
  const permissions = app.roles[role];
  useEffect(() => {
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape" && (xray || expanded)) { setXray(false); setExpanded(false); xrayButton.current?.focus(); }
    }
    function fullscreenChange() { if (!document.fullscreenElement) setExpanded(false); }
    document.addEventListener("keydown", escape);
    document.addEventListener("fullscreenchange", fullscreenChange);
    return () => { document.removeEventListener("keydown", escape); document.removeEventListener("fullscreenchange", fullscreenChange); };
  }, [xray, expanded]);
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (expanded) setExpanded(false);
      else if (previewRef.current?.requestFullscreen) await previewRef.current.requestFullscreen();
      else setExpanded(true);
    } catch { setExpanded(true); reportError("Browser fullscreen is unavailable. Expanded preview is open; press Escape to close."); }
  }
  function switchMode(id: ModeId) { setModeId(id); setSceneId(app.modes[id]?.scenes[0]?.id ?? ""); setFocusId(app.modes[id]?.studentSelectableIds[0] ?? ""); }
  return <LayoutGroup id="application-preview"><div className={`preview-composition ${xray ? "xray-active" : ""} ${expanded ? "expanded-preview" : ""}`} data-laboratory={Boolean(app.modes.laboratory)} ref={previewRef}>
    <div className="preview-toolbar"><div className="preview-title"><span className="preview-dot" /><span>APPLICATION PREVIEW</span><span className="muted">/ {app.title}</span></div><button data-testid="xray-toggle" className={`xray-toggle ${xray ? "on" : ""}`} ref={xrayButton} onClick={() => setXray(!xray)} aria-pressed={xray}><ScanLine /> DNA X-Ray <span>{xray ? "ON" : "OFF"}</span></button></div>
    <div className="preview-and-inspector"><section className="customer-app" aria-label="Generated application simulator"><header className="customer-header"><div className="university-brand"><span>U<ArrowUpRight /></span><div><strong>{app.institution}</strong><small>{app.title}</small></div></div><div className="segment role-switch" aria-label="Preview role"><button data-testid="role-student" aria-pressed={role === "student"} onClick={() => setRole("student")}>Student</button><button data-testid="role-professor" aria-pressed={role === "professor"} onClick={() => setRole("professor")}>Professor</button></div></header>
      <div className="session-bar"><div><span className="eyebrow">{role === "student" ? "YOUR LEARNING SPACE" : "SESSION CONTROL"}</span><h2>{mode.label} <span className="session-state">Simulated session</span></h2></div><label className="mode-select">Session mode<select data-testid="session-mode" name="session-mode" value={modeId} disabled={role !== "professor" || !app.roles.professor.includes("switch-mode")} onChange={e => switchMode(e.target.value as ModeId)}>{Object.entries(app.modes).map(([id, m]) => m && <option value={id} key={id}>{m.label}</option>)}</select>{role === "student" && <small>Set by professor</small>}</label></div>
      {mode.scenes.length > 1 && <label className="scene-select">Scene<select name="session-scene" value={scene.id} onChange={e => setSceneId(e.target.value)}>{mode.scenes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>}
      <div className="preview-source-rail" aria-label="Active source topology"><AnimatePresence initial={false}>{app.sources.filter(s => s.kind === "physical-camera" && sources.some(v => v.kind === "processed-view" && v.physicalCameraId === s.id)).map(camera => <motion.span key={camera.id} layout={!reduced} initial={reduced ? false : { opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .45 }}><Camera size={15} />{camera.label}<span>{"\u2192"} {sources.filter(v => v.kind === "processed-view" && v.physicalCameraId === camera.id).map(v => v.label).join(" / ")}</span></motion.span>)}</AnimatePresence><span>Slides / digital</span></div>
      <div className={v5.productionStage}><div className={v5.canvasColumn}><div className={`viewer ${layout === "grid" ? "viewer-grid" : "viewer-focus"}`}>{(layout === "grid" ? sources : focused ? [focused] : []).map(source => <motion.button layout={reduced ? false : "position"} initial={reduced ? false : { opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : .3 }} key={source.id} className={`main-feed ${focused?.id === source.id ? "is-focused" : ""}`} aria-label={`Focus ${source.label}`} disabled={!permissions.includes("select-view")} onClick={() => { setFocusId(source.id); if (layout === "grid") setLayout("focus"); }}><div className="feed-transform" style={{ transform: source.kind === "processed-view" && role === "professor" ? `scale(${zoom}) translateX(${pan}px)` : undefined }}><FeedArt id={source.id} label={source.label} /></div><span className="feed-label">{source.label}</span><span className="simulated-label">SIMULATED SOURCE</span><span className="feed-origin">{source.kind === "processed-view" ? source.physicalCameraId : "DIGITAL SOURCE"}</span></motion.button>)}</div>
      <div className="viewer-controls"><span className="view-count"><motion.b key={sources.length} initial={reduced ? false : { y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduced ? 0 : .25 }}>{sources.length}</motion.b> selectable views <span>·</span> {app.sources.filter(s => s.kind === "physical-camera" && sources.some(v => v.kind === "processed-view" && v.physicalCameraId === s.id)).length} physical camera{modeId === "laboratory" ? "s" : ""}</span><div className="viewer-actions">{permissions.includes("change-layout") && <button data-testid="layout-toggle" onClick={() => setLayout(layout === "focus" ? "grid" : "focus")}>{layout === "focus" ? <><Grid2X2 /> Grid</> : <><Square /> Focus</>}</button>}{permissions.includes("fullscreen") && <button data-testid="fullscreen-toggle" onClick={fullscreen}><Maximize /> Fullscreen</button>}</div></div>
      <div className="source-selector" aria-label="Selectable views">{sources.map((source, index) => <motion.button layout={reduced ? false : "position"} initial={reduced ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 30 }} data-testid={`view-tile-${source.id}`} key={source.id} disabled={!permissions.includes("select-view")} data-related={xray && Boolean(entry?.appliesTo && (entry.appliesTo.sourceIds.includes(source.id) || (!entry.appliesTo.sourceIds.length && entry.appliesTo.modeIds.includes(modeId))))} className={focused?.id === source.id ? "selected" : ""} aria-pressed={focused?.id === source.id} onClick={() => { setFocusId(source.id); if (xray) { const origin = app.lineage.find(l => l.kind === "new" && l.appliesTo?.sourceIds.includes(source.id)) ?? app.lineage.find(l => l.appliesTo?.sourceIds.includes(source.id)); if (origin) setSelected(origin.componentId); } }}><FeedArt id={source.id} label={source.label} /><span><b>{source.label}</b><small>0{index + 1} / {source.kind === "digital-media" ? "DIGITAL" : "CAMERA VIEW"}</small></span><span className="selected-dot" /></motion.button>)}</div>
      </div><aside className={v5.previewRoutes} aria-label="Physical sources and application change"><span>ROOM → APPLICATION</span>{app.sources.filter(s => s.kind === "physical-camera" && sources.some(v => v.kind === "processed-view" && v.physicalCameraId === s.id)).map(camera => <motion.div layout={!reduced} key={camera.id} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .25 }}><Camera /><strong>{camera.label}</strong><small>↓ processed views</small>{sources.filter(v => v.kind === "processed-view" && v.physicalCameraId === camera.id).map(v => <button key={v.id} aria-pressed={focused?.id === v.id} onClick={() => setFocusId(v.id)}>{v.label} <ArrowRight /></button>)}</motion.div>)}<p>Slides enters independently<br /><strong>Digital source → viewer</strong></p><div className={v5.preservedCard}><strong>{modeId === "lecture" ? "Original Lecture" : "Laboratory extension"}</strong><p>{sources.length} views / {app.sources.filter(s => s.kind === "physical-camera" && sources.some(v => v.kind === "processed-view" && v.physicalCameraId === s.id)).length} physical camera{modeId === "laboratory" ? "s" : ""}</p><small>{hasLab ? "Lecture retains its original three views. Workbench needs placement and coverage review." : "New capture routes require engineering verification."}</small></div></aside></div>
      {role === "professor" && app.roles.professor.includes("camera-ptz") && <div className="ptz-controls" data-testid="ptz-control"><span>Simulated camera control</span><button aria-label="Pan camera left" onClick={() => setPan(Math.max(-30, pan - 10))}><ArrowLeft /></button><button aria-label="Pan camera right" onClick={() => setPan(Math.min(30, pan + 10))}><ArrowRight /></button><button aria-label="Zoom camera in" onClick={() => setZoom(Math.min(1.5, zoom + .1))}><Plus /></button><button aria-label="Zoom camera out" onClick={() => setZoom(Math.max(1, zoom - .1))}><Minus /></button><button onClick={() => { setPan(0); setZoom(1); }}>Reset</button><small>Visual simulation only</small></div>}
      <footer className="customer-footer"><span>{role === "student" ? "Choose your perspective. Follow at your pace." : "Professor permissions enabled · Camera controls are simulated."}</span><span>AMLOS / CONCEPT</span></footer>
    </section><AnimatePresence initial={false}>{xray && <motion.div initial={reduced ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : 24 }} transition={{ duration: reduced ? 0 : .28 }} className="xray-inspection"><div className="xray-heading"><span className="eyebrow">APPLICATION DNA / CONFIG LINEAGE</span><p>Inspect a component. Follow its origin.</p></div><div className="lineage-nodes">{app.lineage.map(l => <button data-testid={`xray-target-${l.componentId}`} key={l.componentId} className={entry?.componentId === l.componentId ? "selected" : entry?.dependencies.includes(l.componentId) ? "related-dependency" : ""} onClick={() => setSelected(l.componentId)} aria-pressed={entry?.componentId === l.componentId}><Kind kind={l.kind} /><strong>{componentName(l.componentId)}</strong><ArrowUpRight /></button>)}</div>{entry && <LineageInspector entry={entry} app={app} onSelect={setSelected} />}<button className="text-button" onClick={() => { setXray(false); xrayButton.current?.focus(); }}>Close X-Ray · Esc</button></motion.div>}</AnimatePresence></div>
    {xray && <div className="lineage-ribbon"><span>CONFIGURATION → PREVIEW → PROVENANCE</span>{app.lineage.map(l => <span key={l.componentId}>{l.dependencies.length ? `${l.componentId} → ${l.dependencies.join(", ")}` : `${l.componentId} / no declared dependency`}</span>)}</div>}
  </div></LayoutGroup>;
}
