export function TrainingSteps({ steps }: { steps: readonly string[] }) {
  return <ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol>;
}
