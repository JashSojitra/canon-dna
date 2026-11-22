"use client";

import { useEffect, useRef, useState } from "react";
import type { GeneratedApp, ModeId } from "@/types/canon-dna";
import { FeedArt } from "./feed-art";
import { Kind, LineageInspector } from "./studio";

export function AppPreview({ app, reportError }: { app: GeneratedApp; reportError: (message: string) => void }) {
  const [role, setRole] = useState<"professor" | "student">("student");
  const [modeId, setModeId] = useState<ModeId>(app.modes.laboratory ? "laboratory" : "lecture");
  const mode = app.modes[modeId] ?? app.modes.lecture;
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
  return <div className={`preview-composition ${xray ? "xray-active" : ""} ${expanded ? "expanded-preview" : ""}`} data-laboratory={Boolean(app.modes.laboratory)} ref={previewRef}>
    <div className="preview-toolbar"><div className="preview-title"><span className="preview-dot" /><span>APPLICATION PREVIEW</span><span className="muted">/ {app.title}</span></div><button className={`xray-toggle ${xray ? "on" : ""}`} ref={xrayButton} onClick={() => setXray(!xray)} aria-pressed={xray}>⌘ DNA X-Ray <span>{xray ? "ON" : "OFF"}</span></button></div>
    <div className="preview-and-inspector"><section className="customer-app" aria-label="Generated application simulator"><header className="customer-header"><div className="university-brand"><span>U<span>↗</span></span><div><strong>{app.institution}</strong><small>{app.title}</small></div></div><div className="segment role-switch" aria-label="Preview role"><button aria-pressed={role === "student"} onClick={() => setRole("student")}>Student</button><button aria-pressed={role === "professor"} onClick={() => setRole("professor")}>Professor</button></div></header>
      <div className="session-bar"><div><span className="eyebrow">{role === "student" ? "YOUR LEARNING SPACE" : "SESSION CONTROL"}</span><h2>{mode.label} <span className="session-state">Simulated session</span></h2></div><label className="mode-select">Session mode<select name="session-mode" value={modeId} disabled={role !== "professor" || !app.roles.professor.includes("switch-mode")} onChange={e => switchMode(e.target.value as ModeId)}>{Object.entries(app.modes).map(([id, m]) => m && <option value={id} key={id}>{m.label}</option>)}</select>{role === "student" && <small>Set by professor</small>}</label></div>
      {mode.scenes.length > 1 && <label className="scene-select">Scene<select name="session-scene" value={scene.id} onChange={e => setSceneId(e.target.value)}>{mode.scenes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>}
      <div className={`viewer ${layout === "grid" ? "viewer-grid" : "viewer-focus"}`}>{(layout === "grid" ? sources : focused ? [focused] : []).map(source => <button key={source.id} className={`main-feed ${focused?.id === source.id ? "is-focused" : ""}`} aria-label={`Focus ${source.label}`} disabled={!permissions.includes("select-view")} onClick={() => { setFocusId(source.id); if (layout === "grid") setLayout("focus"); }}><div className="feed-transform" style={{ transform: source.kind === "processed-view" && role === "professor" ? `scale(${zoom}) translateX(${pan}px)` : undefined }}><FeedArt id={source.id} label={source.label} /></div><span className="feed-label">{source.label}</span><span className="simulated-label">SIMULATED SOURCE</span><span className="feed-origin">{source.kind === "processed-view" ? source.physicalCameraId : "DIGITAL SOURCE"}</span></button>)}</div>
      <div className="viewer-controls"><span className="view-count">{sources.length} selectable views <span>·</span> {app.sources.filter(s => s.kind === "physical-camera" && sources.some(v => v.kind === "processed-view" && v.physicalCameraId === s.id)).length} physical camera{modeId === "laboratory" ? "s" : ""}</span><div className="viewer-actions">{permissions.includes("change-layout") && <button onClick={() => setLayout(layout === "focus" ? "grid" : "focus")}>{layout === "focus" ? "▦ Grid" : "▣ Focus"}</button>}{permissions.includes("fullscreen") && <button onClick={fullscreen}>⛶ Fullscreen</button>}</div></div>
      <div className="source-selector" aria-label="Selectable views">{sources.map((source, index) => <button key={source.id} disabled={!permissions.includes("select-view")} className={focused?.id === source.id ? "selected" : ""} aria-pressed={focused?.id === source.id} onClick={() => setFocusId(source.id)}><FeedArt id={source.id} label={source.label} /><span><b>{source.label}</b><small>0{index + 1} / {source.kind === "digital-media" ? "DIGITAL" : "CAMERA VIEW"}</small></span><span className="selected-dot" /></button>)}</div>
      {role === "professor" && app.roles.professor.includes("camera-ptz") && <div className="ptz-controls"><span>Simulated camera control</span><button aria-label="Pan camera left" onClick={() => setPan(Math.max(-30, pan - 10))}>←</button><button aria-label="Pan camera right" onClick={() => setPan(Math.min(30, pan + 10))}>→</button><button aria-label="Zoom camera in" onClick={() => setZoom(Math.min(1.5, zoom + .1))}>+</button><button aria-label="Zoom camera out" onClick={() => setZoom(Math.max(1, zoom - .1))}>−</button><button onClick={() => { setPan(0); setZoom(1); }}>Reset</button><small>Visual simulation only</small></div>}
      <footer className="customer-footer"><span>{role === "student" ? "Choose your perspective. Follow at your pace." : "Professor permissions enabled · Camera controls are simulated."}</span><span>AMLOS / CONCEPT</span></footer>
    </section>{xray && <div className="xray-inspection"><div className="xray-heading"><span className="eyebrow">APPLICATION DNA / CONFIG LINEAGE</span><p>Inspect a component. Follow its origin.</p></div><div className="lineage-nodes">{app.lineage.map(l => <button key={l.componentId} className={entry?.componentId === l.componentId ? "selected" : ""} onClick={() => setSelected(l.componentId)} aria-pressed={entry?.componentId === l.componentId}><Kind kind={l.kind} /><strong>{l.componentId}</strong><span>↗</span></button>)}</div>{entry && <LineageInspector entry={entry} app={app} onSelect={setSelected} />}<button className="text-button" onClick={() => { setXray(false); xrayButton.current?.focus(); }}>Close X-Ray · Esc</button></div>}</div>
    {xray && <div className="lineage-ribbon"><span>CONFIGURATION → PREVIEW → PROVENANCE</span>{app.lineage.map(l => <span key={l.componentId}>{l.dependencies.length ? `${l.componentId} → ${l.dependencies.join(", ")}` : `${l.componentId} / no declared dependency`}</span>)}</div>}
  </div>;
}
