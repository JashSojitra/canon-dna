import type { CoverageRequest, LectureRequirements } from "../types/canon-dna";

export const lecturePrompt =
  "Build a university classroom with Professor and Whiteboard views from one camera, digital Slides, Professor controls, and a remote Student viewer.";
export const labPrompt =
  "Tomorrow is a lab. Add a Workbench camera, let students choose four views, and keep Lecture mode unchanged.";
export const hiddenViewPrompt =
  "Show the hidden side of the workbench using the same front camera without a line of sight.";

export const lectureRequirements: LectureRequirements = {
  kind: "lecture",
  institution: "Example University",
  title: "University Classroom",
};
export const hiddenViewRequest: CoverageRequest = {
  kind: "coverage",
  viewLabel: "Hidden side of workbench",
  hasLineOfSight: false,
};
