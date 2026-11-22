# Phase 2 engine contract changes

Existing imports, function signatures and discriminants remain available. Bootstrap configurations and saved recipes can omit the added fields.

- `Lineage` adds optional `capabilities: string[]` and `appliesTo: { modeIds: ModeId[]; sourceIds: string[] }`. Generated app validation checks references in `appliesTo`. The demo recipes carry additional lineage entries, so consumers should use component IDs when looking up entries.
- `AppDiff` entries add optional `changedFields: string[]`, `before` and `after` JSON values. The engine emits them for changed entities. Existing entity and change values are preserved.
- `Blueprint` adds optional `sourceTopology: { cameras: { cameraId: string; processedViewIds: string[] }[]; digitalSourceIds: string[] }` and `review: ValidationResult`. `composeBlueprint` supplies both. Roles, permissions, modes, assumptions, dependencies and proposed SDK mappings are in its validated `app` snapshot.
- `ValidationResult` issues add optional `path`, `componentId` and `layer` references for the inspector.
- `@/lib/engine` adds `inspectApp(input: unknown): ValidationResult`, `serializeApprovedRecipe(recipe: ApprovedRecipe): string` and `deserializeApprovedRecipe(serialized: string): ApprovedRecipe`. Persistence helpers validate at both boundaries. Storage remains the studio’s responsibility.
- Sample manifests reject duplicate graph edges. Reuse matching uses manifest capabilities. Natural-language interpretation uses deterministic rules for supported scenario paraphrases. Both structured and text inputs retain the existing `InterpretationResult` shape.
