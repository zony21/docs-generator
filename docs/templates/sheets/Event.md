# Event

## 1. Document metadata
- Package name: {{packageName}}
- Document type: Event
- Output file: sheets/Event.md
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

### 4.1 Event list
| Event Name | Trigger | Target Function/Process | Remarks |
| --- | --- | --- | --- |
{{#each events}}
| {{markdownCell name}} | {{markdownCell trigger}} | {{markdownCell target}} | {{markdownCell remarks}} |
{{else}}
|  |  |  |  |
{{/each}}

### 4.2 Additional event notes
{{#if additionalNotes}}
- {{additionalNotes}}
{{else}}
No concrete entries.
{{/if}}

## 5. Blank / N/A handling
- Keep the table frame even when event rows are blank.
- If no concrete values exist, write exactly: No concrete entries.
- Do not infer missing values.
- Do not add implementation assumptions.
