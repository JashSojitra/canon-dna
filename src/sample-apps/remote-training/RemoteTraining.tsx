import { DemonstrationView } from "./DemonstrationView";
import { TrainingSteps } from "./TrainingSteps";

export function RemoteTraining() {
  return (
    <section>
      <h2>AMLOS Remote Training</h2>
      <p>Team-created sample application</p>
      <DemonstrationView label="Instructor demonstration" />
      <TrainingSteps steps={["Review the workstation", "Watch the demonstration", "Complete the practice task"]} />
    </section>
  );
}
