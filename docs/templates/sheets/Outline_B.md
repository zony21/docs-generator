# Outline_B

## 1. Document metadata
- Package name: {{packageName}}
- Document type: Outline_B
- Output file: sheets/Outline_B.md
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

### 4.1 Processing style/classification
{{#if processingStyle}}
{{processingStyle}}
{{else}}
No concrete entries.
{{/if}}

### 4.2 CRUD / operation categories
| Category | Description |
| --- | --- |
{{#each operationCategories}}
| {{markdownCell category}} | {{markdownCell description}} |
{{else}}
|  |  |
{{/each}}

### 4.3 Related tables/masters/interfaces
| Type | Name | Notes |
| --- | --- | --- |
{{#each relatedResources}}
| {{markdownCell type}} | {{markdownCell name}} | {{markdownCell notes}} |
{{else}}
|  |  |  |
{{/each}}

### 4.4 Operational constraints and remarks
{{#if constraints}}
{{constraints}}
{{else}}
No concrete entries.
{{/if}}

## 5. Blank / N/A handling
- If no concrete values exist, write exactly: No concrete entries.
- Do not infer missing values.
- Do not add implementation assumptions.
