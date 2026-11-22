import { applyLabRequirement, buildLectureApp, matchReusableComponents } from "../lib/engine";
import { labPrompt, lectureRequirements } from "./demo-prompts";
import { sampleApps } from "./sample-apps";

export const lectureApp = buildLectureApp(lectureRequirements, matchReusableComponents(lectureRequirements, sampleApps));
export const laboratoryApp = applyLabRequirement(lectureApp, labPrompt);
