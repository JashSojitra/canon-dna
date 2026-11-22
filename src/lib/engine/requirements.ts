import { lectureRequirements } from "../../data/demo-prompts";
import { interpretationResultSchema, type CanonDnaEngine, type Requirements } from "../../types/canon-dna";

function inferRequirements(text: string): Requirements | undefined {
  const normalized = text.normalize("NFKC").toLowerCase().replace(/[‐‑–—-]/g, " ");
  const bench = /\b(?:workbench|work bench|lab bench|workstation|worktable|work table)\b/.test(normalized);
  const camera = /\b(?:camera|cam|webcam)s?\b/.test(normalized);
  const blocked = /\b(?:hidden|occluded|blind spot|blocked|(?:no|without) (?:a )?(?:clear )?line of sight|(?:cannot|can't) see)\b/.test(normalized);
  const rear = /\b(?:opposite|back|far|rear|other) side\b/.test(normalized);
  const single = /\b(?:same|only|single|existing|front)\b/.test(normalized);

  const remedy = /\b(?:add|install|introduce|set up|mount|point|bring)\b[^.!?]*\b(?:second|extra|additional|another|new) (?:physical )?(?:camera|cam|webcam)\b/.test(normalized);
  if (bench && camera && !remedy && (blocked || (rear && single))) {
    return { kind: "coverage", viewLabel: "Hidden side of workbench", hasLineOfSight: false };
  }

  const addCamera = /\b(?:add|introduce|include|install|second|another|extra|additional|new|two|2)\b/.test(normalized);
  const removeOrReplace = /\b(?:remove|replace|drop|disable|delete|no longer)\b/.test(normalized);
  if (bench && camera && addCamera && !removeOrReplace) return { kind: "laboratory" };

  const instructor = /\b(?:professor|instructor|teacher|lecturer|presenter)\b/.test(normalized);
  const board = /\b(?:white ?board|black ?board|chalk ?board|board)\b/.test(normalized);
  const slides = /\b(?:slides?|slide deck|powerpoint|presentation|screen shar(?:e|ing))\b/.test(normalized);
  const incompatible = /\b(?:two|three|separate|multiple|[2-9]) (?:physical )?cameras\b|\b(?:students?|learners?) (?:can|may|should|must) (?:also )?(?:control|operate|pan|tilt|zoom|ptz)\b/.test(normalized);
  if (instructor && board && slides && !incompatible && !removeOrReplace) {
    return { ...lectureRequirements };
  }
}

export const interpretRequirements: CanonDnaEngine["interpretRequirements"] = (text, structured) => {
  const requirements = structured ?? inferRequirements(text);
  const parsed = interpretationResultSchema.safeParse({ ok: true, interpretationMode: "rules-demo", requirements });
  return parsed.success ? parsed.data : {
    ok: false,
    interpretationMode: "rules-demo",
    message: "Describe a classroom with instructor, board and slides, add a Workbench camera, or provide valid structured requirements.",
  };
};
