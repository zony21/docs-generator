# Relation

## 1. Document metadata
- Package name: {{packageName}}
- Document type: Relation
- Output file: sheets/Relation.md
- Generated at: {{generatedAt}}
- Template version: {{templateVersion}}

## 2. Common metadata
- System Name: {{orDash common.systemName}}
- Module Name: {{orDash common.moduleName}}
- Module ID: {{orDash common.moduleId}}
- Feature ID: {{orDash common.featureId}}
- Feature Name: {{orDash common.featureName}}
- Date: {{orDash common.date}}
- Rev: {{orDash common.revision}}
- Doc Number: {{orDash common.documentNumber}}
- Author: {{orDash common.author}}

## 3. Document summary
- Title: {{orDash summary.title}}
- Screen / component name: {{orDash summary.screenOrComponentName}}
- Event / check / function name: {{orDash summary.eventCheckFunctionName}}
- Timing: {{orDash summary.timing}}
- Notes: {{orDash summary.notes}}

## 4. Main content
{{#each relations}}

### 4.{{number @index}} {{orDash name}}

#### Transfer Source
- Source entity/table/field: {{orDash source.definition}}
- Conditions: {{orDash source.conditions}}

#### Transfer Destination
- Destination entity/table/field: {{orDash destination.definition}}
- Conditions: {{orDash destination.conditions}}

{{#if mappings}}
#### Mapping
| Source | Destination | Conversion/Condition | Notes |
| --- | --- | --- | --- |
{{#each mappings}}
| {{markdownCell source}} | {{markdownCell destination}} | {{markdownCell conversion}} | {{markdownCell notes}} |
{{/each}}
{{/if}}

{{#if sql}}
#### SQL definition
```sql
{{sql}}
```
{{/if}}
{{else}}

No concrete entries.
{{/each}}

## 5. Blank / N/A handling
- Keep Transfer Source and Transfer Destination as separate sections.
- Use fenced sql blocks for multi-line SQL.
- Do not rewrite SQL logic.
- If no concrete values exist, write exactly: No concrete entries.
- Do not infer missing values.
- Do not add implementation assumptions.
