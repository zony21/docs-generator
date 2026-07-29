# FuncSpec

## 1. Document metadata
- Package name: {{packageName}}
- Document type: FuncSpec
- Output file: sheets/FuncSpec.md
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
{{#each units}}

### 4.{{number @index}} Screen/function unit
- Name: {{orDash name}}

#### Trigger/timing
- {{orDash trigger}}

#### Action details
1. Intent
   - {{orDash intent}}
2. Major steps
{{#each majorSteps}}
   {{number @index}}. {{this}}
{{else}}
   - No concrete entries.
{{/each}}
3. Success path
   - {{orDash successPath}}
4. Error/interruption path
   - {{orDash errorPath}}
{{#if notes}}
5. Notes
   - {{notes}}
{{/if}}
{{else}}

No concrete entries.
{{/each}}

## 5. Blank / N/A handling
- If no concrete values exist, write exactly: No concrete entries.
- Do not infer missing values.
- Do not add implementation assumptions.
