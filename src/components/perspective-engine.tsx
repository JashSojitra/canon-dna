"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "motion/react";
import { Camera, Monitor, Plus } from "lucide-react";
import { lectureApp, laboratoryApp } from "@/data/demo-apps";
import { FeedArt } from "./feed-art";

export function PerspectiveEngine() {
  const [laboratory, setLaboratory] = useState(false);
  const [selected, setSelected] = useState("professor");
  const reduced = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const app = laboratory ? laboratoryApp : lectureApp;
  const mode = laboratory ? app.modes.laboratory! : app.modes.lecture;
  const sources = mode.studentSelectableIds.map(id => app.sources.find(source => source.id === id)!);
  const cameras = app.sources.filter(source => source.kind === "physical-camera" && sources.some(view => view.kind === "processed-view" && view.physicalCameraId === source.id));
  const focused = sources.find(source => source.id === selected) ?? sources[0];
  function resetTilt() { stage.current?.style.setProperty("--tilt-x", "0deg"); stage.current?.style.setProperty("--tilt-y", "0deg"); }
  return <section id="transformation" className="perspective-engine" aria-label="Interactive illustrative preview">
    <div className="engine-heading"><span className="eyebrow">PERSPECTIVE ENGINE</span><div className="engine-mode" aria-label="Illustrative classroom mode">{[false, true].map(lab => <button key={String(lab)} aria-pressed={laboratory === lab} onClick={() => { setLaboratory(lab); if (!lab && selected === "workbench") setSelected("professor"); }}>{lab ? "Laboratory" : "Lecture"}{lab && <Plus size={13} />}</button>)}</div></div>
    <LayoutGroup id="perspective"><motion.div ref={stage} className="optic-stage" initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .6 }} onPointerLeave={resetTilt}>
      <div className="optic-object"><div className="optic-topology"><div className="camera-stack"><AnimatePresence initial={false}>{cameras.map((camera, index) => <motion.div layout={!reduced} key={camera.id} className="camera-object" initial={reduced ? false : { opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .45 }}><div className="camera-hardware"><span className="camera-vent" /><div className="camera-lens"><i /></div><Camera size={16} /></div><span>PHYSICAL / 0{index + 1}</span><strong>{camera.label}</strong></motion.div>)}</AnimatePresence><div className="digital-object"><Monitor size={18} /><span>Slides / digital source</span></div></div>
      <svg className="optic-rays" viewBox="0 0 180 310" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="optic-ray"><stop stopColor="#e21c2a" /><stop offset="1" stopColor="#f2aaa9" /></linearGradient></defs>{sources.map((source, index) => { const start = source.kind === "digital-media" ? 280 : source.kind === "processed-view" && source.physicalCameraId !== cameras[0]?.id ? 195 : 45; const end = 34 + index * 77; return <motion.path key={source.id} d={`M0 ${start} C85 ${start}, 80 ${end}, 180 ${end}`} fill="none" stroke="url(#optic-ray)" strokeWidth="1.4" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : .65 }} />; })}</svg>
      <div className="optic-outputs"><AnimatePresence initial={false}>{sources.map(source => <motion.button layout={!reduced} key={source.id} data-testid={`hero-view-${source.id}`} aria-pressed={focused.id === source.id} onClick={() => setSelected(source.id)} initial={reduced ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={reduced ? { duration: 0 } : { type: "spring", damping: 30, stiffness: 250 }}><FeedArt id={source.id} label={source.label} /><span>{source.label}<small>{source.kind === "digital-media" ? "DIGITAL INPUT" : "PROCESSED VIEW"}</small></span></motion.button>)}</AnimatePresence></div></div>
      <div className="optic-monitor"><div className="monitor-bar"><span>APPLICATION VIEWER</span><span>{mode.label}</span></div><div className="monitor-picture"><AnimatePresence initial={false} mode="popLayout"><motion.div key={focused.id} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .22 }}><FeedArt id={focused.id} label={focused.label} /></motion.div></AnimatePresence><span className="monitor-reticle" /><strong>{focused.label}</strong><small>SIMULATED SOURCE</small></div><div className="monitor-foot"><span>{app.institution}</span><span>CONFIG → VIEW</span></div></div></div>
    </motion.div></LayoutGroup>
    <div className="engine-metrics" aria-live="polite"><div><motion.strong key={`c${cameras.length}`} initial={reduced ? false : { y: 9, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{cameras.length}</motion.strong>{" "}<span>physical camera{cameras.length === 1 ? "" : "s"}</span></div><span className="metric-split">→</span><div><motion.strong key={`v${sources.length}`} initial={reduced ? false : { y: 9, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{sources.length}</motion.strong>{" "}<span>selectable views</span></div></div>
    <p className="engine-caption">ILLUSTRATIVE VIEWER / SIMULATED SOURCES</p><p className="engine-explanation">{laboratory ? "Second camera added. Original Lecture mode preserved." : "One camera → Professor + Whiteboard. Slides stays digital."}</p>
  </section>;
}
