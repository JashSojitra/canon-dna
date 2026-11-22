"use client";

import { useState } from "react";
import { SourceSelector } from "./SourceSelector";

const views = ["Professor", "Whiteboard", "Slides"];

export function Classroom() {
  const [view, setView] = useState(views[0]);
  return (
    <section>
      <h2>AMLOS Classroom</h2>
      <p>Team-created sample application</p>
      <SourceSelector views={views} selected={view} onSelect={setView} />
      <p role="status">{view} · Simulated source</p>
    </section>
  );
}
