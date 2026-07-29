# Others

## 1. Document metadata
- Package name: {{packageName}}
- Document type: Others
- Output file: sheets/Others.md
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

### 4.1 Shared constants/definitions
| Name | Value | Notes |
| --- | --- | --- |
{{#each constants}}
| {{markdownCell name}} | {{markdownCell value}} | {{markdownCell notes}} |
{{else}}
|  |  |  |
{{/each}}

### 4.2 Option/function key/helper mappings
| Category | Mapping | Notes |
| --- | --- | --- |
{{#each mappings}}
| {{markdownCell category}} | {{markdownCell mapping}} | {{markdownCell notes}} |
{{else}}
|  |  |  |
{{/each}}

### 4.3 Supplemental operational notes
{{#each operationalNotes}}
- {{this}}
{{else}}
No concrete entries.
{{/each}}

## 5. Blank / N/A handling
- If no concrete values exist, write exactly: No concrete entries.
- Do not infer missing values.
- Do not add implementation assumptions.
