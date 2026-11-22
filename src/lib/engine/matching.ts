import { sampleAppSchema, type CanonDnaEngine, type Lineage, type SampleApp } from "../../types/canon-dna";

type SampleMatch = {
  capability: string;
  kind: "reuse" | "adapt";
  reason: string;
  appliesTo: NonNullable<Lineage["appliesTo"]>;
  verification: string;
};

const lectureMatches: SampleMatch[] = [
  {
    capability: "lecture-preview", kind: "adapt", appliesTo: { modeIds: ["lecture"], sourceIds: [] },
    reason: "Keep the active-view state and layout pattern. Replace the fixed sample labels with recipe sources and add role-specific controls.",
    verification: "Verify the professor and student layouts against the generated roles.",
  },
  {
    capability: "select-view", kind: "reuse", appliesTo: { modeIds: ["lecture"], sourceIds: [] },
    reason: "The selector takes a list of labels and a selection callback, so the same component can accept either mode's views.",
    verification: "Verify keyboard selection and eligibility for each mode.",
  },
  {
    capability: "announce-active-view", kind: "reuse", appliesTo: { modeIds: ["lecture"], sourceIds: [] },
    reason: "The status component accepts the active label and announces changes for either mode.",
    verification: "Verify assistive technology announces view switches.",
  },
];

const lectureDemonstrationMatch: SampleMatch = {
  capability: "label-demonstration-view", kind: "adapt",
  appliesTo: { modeIds: ["lecture"], sourceIds: ["professor"] },
  reason: "Adapt the remote training sample’s instructor demonstration label to identify the Professor view in the classroom preview.",
  verification: "Verify the Professor label and displayed source stay in sync.",
};

const labDemonstrationMatch: SampleMatch = {
  capability: "label-demonstration-view", kind: "adapt",
  appliesTo: { modeIds: ["laboratory"], sourceIds: ["workbench"] },
  reason: "Use the training sample's simulated demonstration label for Workbench and bind it to the new selectable camera view.",
  verification: "Verify the Workbench label and displayed source stay in sync.",
};

function findMatch(library: readonly SampleApp[], match: SampleMatch): Lineage | undefined {
  for (const project of library) {
    const component = project.components.find(({ capabilities }) => capabilities.includes(match.capability));
    if (!component) continue;
    return {
      componentId: component.id,
      kind: match.kind,
      sampleProjectId: project.id,
      sourceFile: component.sourceFile,
      dependencies: project.dependencies.filter(({ from }) => from === component.id).map(({ to }) => to),
      capabilities: component.capabilities,
      appliesTo: structuredClone(match.appliesTo),
      reason: match.reason,
      proposedAmlosLayers: component.proposedAmlosLayers,
      verificationRequired: [match.verification],
    };
  }
}

export const matchReusableComponents: CanonDnaEngine["matchReusableComponents"] = (requirements, library) => {
  if (requirements.kind === "coverage") return [];
  const projects = library.flatMap((candidate) => {
    const parsed = sampleAppSchema.safeParse(candidate);
    return parsed.success ? [parsed.data] : [];
  });

  if (requirements.kind === "laboratory") {
    const demonstration = findMatch(projects, labDemonstrationMatch);
    return [
      ...(demonstration && demonstration.componentId !== "workbench-view" ? [demonstration] : []),
      {
        componentId: "workbench-view",
        kind: "new",
        dependencies: [],
        capabilities: ["workbench-capture"],
        appliesTo: { modeIds: ["laboratory"], sourceIds: ["workbench-camera", "workbench"] },
        reason: "The lab needs a dedicated physical camera and processed Workbench view. The samples provide browser presentation patterns.",
        proposedAmlosLayers: ["Camera", "Hub"],
        verificationRequired: ["Confirm the proposed camera placement, line of sight and workbench coverage."],
      },
    ];
  }

  const matches = new Map<string, Lineage>();
  for (const target of [...lectureMatches, lectureDemonstrationMatch]) {
    const match = findMatch(projects, target);
    if (match && !matches.has(match.componentId)) matches.set(match.componentId, match);
  }
  matches.set("lecture-source-topology", {
    componentId: "lecture-source-topology",
    kind: "new",
    dependencies: [],
    capabilities: ["shared-camera-views", "digital-slide-source"],
    appliesTo: { modeIds: ["lecture"], sourceIds: ["classroom-camera", "professor", "whiteboard", "slides"] },
    reason: "The classroom sample selects simulated labels. The recipe adds an explicit shared-camera topology for Professor and Whiteboard and an independent digital Slides source.",
    proposedAmlosLayers: ["Camera", "Hub"],
    verificationRequired: ["Confirm both lecture views are achievable from one camera position and that the digital slides can be distributed separately."],
  });
  return [...matches.values()];
};
