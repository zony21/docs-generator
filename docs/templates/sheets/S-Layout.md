# S-Layout

## 1. Document metadata
- Package name: {{packageName}}
- Document type: S-Layout
- Output file: sheets/S-Layout.md
- Asset directory: sheets/S-Layout/
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

### 4.1 Screen images
{{#each images}}
{{#if title}}
#### {{title}}
{{/if}}

![{{altText}}]({{relativePath}})
{{#if caption}}

{{caption}}
{{/if}}

{{else}}
No images attached.
{{/each}}

### 4.2 Screen sections/areas
| Area | Description |
| --- | --- |
{{#each areas}}
| {{markdownCell name}} | {{markdownCell description}} |
{{else}}
|  |  |
{{/each}}

### 4.3 Control list
| Control ID | Control Name | Type | Area |
| --- | --- | --- | --- |
{{#each controls}}
| {{markdownCell id}} | {{markdownCell name}} | {{markdownCell type}} | {{markdownCell area}} |
{{else}}
|  |  |  |  |
{{/each}}

### 4.4 Control properties
| Control ID | Length/Format | Required | Default | Remarks |
| --- | --- | --- | --- | --- |
{{#each controlProperties}}
| {{markdownCell controlId}} | {{markdownCell lengthOrFormat}} | {{markdownCell required}} | {{markdownCell defaultValue}} | {{markdownCell remarks}} |
{{else}}
|  |  |  |  |  |
{{/each}}

### 4.5 Display/edit rules
{{#each displayEditRules}}
- {{this}}
{{else}}
No concrete entries.
{{/each}}

## 5. Blank / N/A handling
- Keep meaningful table frames even when details are blank.
- If no concrete values exist, write exactly: No concrete entries.
- If no images are attached, write exactly: No images attached.
- Do not infer missing values.
- Do not add implementation assumptions.
