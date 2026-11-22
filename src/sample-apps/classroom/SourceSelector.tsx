"use client";

export function SourceSelector({
  views,
  selected,
  onSelect,
}: {
  views: readonly string[];
  selected: string;
  onSelect: (view: string) => void;
}) {
  return (
    <nav aria-label="Simulated views">
      {views.map((view) => (
        <button key={view} type="button" aria-pressed={view === selected} onClick={() => onSelect(view)}>
          {view}
        </button>
      ))}
    </nav>
  );
}
