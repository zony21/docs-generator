# R-Layout

## 1. Document metadata
- Package name: {{packageName}}
- Document type: R-Layout
- Output file: sheets/R-Layout.md
- Asset directory: sheets/R-Layout/
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

### 4.1 Layout images
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

### 4.2 Layout blocks and areas
| Block/Area | Description |
| --- | --- |
{{#each layoutBlocks}}
| {{markdownCell name}} | {{markdownCell description}} |
{{else}}
|  |  |
{{/each}}

### 4.3 Output/display item list
| Item | Description |
| --- | --- |
{{#each outputItems}}
| {{markdownCell item}} | {{markdownCell description}} |
{{else}}
|  |  |
{{/each}}

### 4.4 Column-level definitions
| Item | Type | Width | Alignment | Format | Notes |
| --- | --- | --- | --- | --- | --- |
{{#each columns}}
| {{markdownCell item}} | {{markdownCell type}} | {{markdownCell width}} | {{markdownCell alignment}} | {{markdownCell format}} | {{markdownCell notes}} |
{{else}}
|  |  |  |  |  |  |
{{/each}}

### 4.5 Rendering/output behavior notes
{{#each outputBehaviorNotes}}
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
