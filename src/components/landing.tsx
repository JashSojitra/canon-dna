"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight, ArrowUpRight, Dna } from "lucide-react";
import { laboratoryApp, lectureApp } from "@/data/demo-apps";
import { lecturePrompt } from "@/data/demo-prompts";
import { PerspectiveEngine } from "./perspective-engine";
import { ReuseWorkshop, TopologyCanvas } from "./v5-experience";
import v5 from "./v5.module.css";
import { FeedArt } from "./feed-art";

export function Landing() {
  const reduced = useReducedMotion();
  const reveal = { initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .15 }, transition: { duration: reduced ? 0 : .55 } };
  return <div className={`landing v4-landing ${v5.landing}`}>
    <header className="landing-header"><Link className="landing-brand" href="/" aria-label="Canon DNA overview"><Dna /><span>CANON <b>DNA</b></span></Link><span className="concept-line">Independent hackathon concept</span><nav aria-label="Overview"><Link href="#how-it-works">The process</Link><Link href="/studio">Launch studio <ArrowUpRight /></Link></nav></header>
    <main className="landing-main">
      <section className="cinema-hero">
        <div className="cinema-copy"><p className="eyebrow">EXISTING ENGINEERING → NEW APPLICATION DESIGN</p><h1>Don’t start from zero.<br /><span>Start from everything you’ve built.</span></h1><p className="hero-description">Turn the engineering in existing applications into a new customer experience. See what we can reuse, what needs adapting, and what an engineer must design next.</p><div className="hero-actions"><Link className="button primary" href="/studio">Launch studio <ArrowRight /></Link><Link href="#transformation">Watch the transformation <ArrowDown /></Link></div><p className="prototype-note">Application design prototype.<br />Illustrated sources. No camera connection.</p></div>
        <PerspectiveEngine />
        <div className="hero-baseline"><span>01 / EXISTING PARTS → NEW DESIGN</span><span>ONE VALIDATED RECIPE. EVERY DECISION TRACEABLE.</span><ArrowDown /></div>
      </section>
      <motion.section {...reveal} className="process-design"><div className="request-paper"><span className="eyebrow">CUSTOMER REQUIREMENT / SUPPLIED EXAMPLE</span><blockquote>“{lecturePrompt}”</blockquote><div><span>Guided rules demo</span><ArrowRight /><span>Validated configuration</span></div></div><div className="editorial-heading"><p className="eyebrow">02 / DESIGN</p><h2>Reuse is a decision.<br />Show the reasoning.</h2><p>The supported request resolves into a structured application recipe. Every part carries a classification and a reason.</p></div></motion.section>
      <section id="how-it-works" className={v5.landingWorkshop}><div className="editorial-heading"><p className="eyebrow">02 / REUSABLE DNA WORKSHOP</p><h2>Old application. New possibilities.</h2><p>Touch a part. Compare its original purpose with the proposed design.</p></div><ReuseWorkshop app={laboratoryApp} /></section>
      <motion.section {...reveal} className="process-evolve"><div className="editorial-heading"><p className="eyebrow">03 / EVOLVE</p><h2>Tomorrow changes.<br />Keep what works.</h2><p>A second physical camera adds a Workbench view and Laboratory mode. Lecture keeps its original {lectureApp.modes.lecture.studentSelectableIds.length} views.</p><Link className="process-link" href="/studio?stage=architect">Design the next requirement <ArrowUpRight /></Link></div><EvolveStoryboard /></motion.section>
      <TopologyCanvas app={laboratoryApp} /><section className="landing-close"><Dna /><h2>Designed by reuse.<br />Approved by a human.</h2><Link className="button primary" href="/studio">Launch studio <ArrowRight /></Link><p>Browser-local recipes. Deterministic demo rules. Proposed AMLOS mappings remain unverified.</p></section>
    </main><footer className="landing-footer"><span>CANON DNA · Independent hackathon concept for Canon AMLOS</span><span>Application design / simulated sources / no live AI</span></footer>
  </div>;
}

function EvolveStoryboard() {
  const [evolved, setEvolved] = useState(false);
  const reduced = useReducedMotion();
  const app = evolved ? laboratoryApp : lectureApp;
  const mode = evolved ? app.modes.laboratory! : app.modes.lecture;
  return <motion.div className="evolve-film" onViewportEnter={() => setEvolved(true)} viewport={{ once: true, amount: .6 }}>
    <div className="film-heading"><span>LECTURE / LABORATORY</span><strong>{mode.studentSelectableIds.length} selectable views</strong></div>
    <div className="film-views"><AnimatePresence initial={false}>{mode.studentSelectableIds.map(id => <motion.div layout={!reduced} key={id} initial={reduced ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : { type: "spring", damping: 30, stiffness: 240 }} className={lectureApp.modes.lecture.studentSelectableIds.includes(id) ? "" : "film-new"}><FeedArt id={id} label={app.sources.find(s => s.id === id)!.label} /><span>{app.sources.find(s => s.id === id)!.label}</span></motion.div>)}</AnimatePresence></div>
    <div className="film-replay"><button onClick={() => setEvolved(!evolved)}>{evolved ? "Replay original Lecture" : "Add laboratory camera"}<ArrowRight /></button><span>{evolved ? "Lecture preserved" : "Original configuration"}</span></div>
  </motion.div>;
}
