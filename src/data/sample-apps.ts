import { sampleAppSchema, type SampleApp } from "../types/canon-dna";

export const sampleApps: readonly SampleApp[] = [
  sampleAppSchema.parse({
    id: "classroom",
    name: "AMLOS Classroom",
    origin: "team-created",
    entryFile: "src/sample-apps/classroom/Classroom.tsx",
    components: [
      {
        id: "classroom-preview",
        name: "Classroom Preview",
        sourceFile: "src/sample-apps/classroom/Classroom.tsx",
        capabilities: ["lecture-preview"],
        proposedAmlosLayers: ["Edge"],
      },
      {
        id: "source-selector",
        name: "Source Selector",
        sourceFile: "src/sample-apps/classroom/SourceSelector.tsx",
        capabilities: ["select-view"],
        proposedAmlosLayers: ["Edge"],
      },
    ],
    dependencies: [{ from: "classroom-preview", to: "source-selector" }],
  }),
  sampleAppSchema.parse({
    id: "remote-training",
    name: "AMLOS Remote Training",
    origin: "team-created",
    entryFile: "src/sample-apps/remote-training/RemoteTraining.tsx",
    components: [
      {
        id: "training-preview",
        name: "Training Preview",
        sourceFile: "src/sample-apps/remote-training/RemoteTraining.tsx",
        capabilities: ["training-preview"],
        proposedAmlosLayers: ["Edge"],
      },
      {
        id: "training-steps",
        name: "Training Steps",
        sourceFile: "src/sample-apps/remote-training/TrainingSteps.tsx",
        capabilities: ["guided-training"],
        proposedAmlosLayers: ["Edge"],
      },
    ],
    dependencies: [{ from: "training-preview", to: "training-steps" }],
  }),
];
