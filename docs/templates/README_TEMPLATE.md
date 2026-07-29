# {{common.featureId}} {{common.featureName}} 設計書

## How to use this folder
- Start from this README to understand the role and scope of the feature.
- Open the document files under `sheets/` in the order shown below.
- Review attached images from the Markdown document that references them.

## Feature
- system_name: {{orDash common.systemName}}
- module_name: {{orDash common.moduleName}}
- module_id: {{orDash common.moduleId}}
- feature_id: {{orDash common.featureId}}
- feature_name: {{orDash common.featureName}}
- feature_type: {{orDash featureTypeLabel}}
- revision: {{orDash common.revision}}
- author: {{orDash common.author}}
- generated_at: {{generatedAt}}
- template_version: {{templateVersion}}

## Document index

| Document | File |
| --- | --- |
{{#each generatedDocuments}}
| {{displayName}} | [{{outputPath}}]({{outputPath}}) |
{{/each}}

## Notes
- This package contains the documents selected for one feature.
- Markdown files are the authoritative design documents.
- Unselected document templates are not generated.
