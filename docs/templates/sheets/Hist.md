# Hist

## 1. Document metadata
- Package name: {{packageName}}
- Document type: Hist
- Output file: sheets/Hist.md
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

### 4.1 Revision history

| Creation/Update Date | Author | Rev. | Target Document/Area | Change Note | Approval Date | Approval By |
| --- | --- | --- | --- | --- | --- | --- |
{{#each revisions}}
| {{markdownCell date}} | {{markdownCell author}} | {{markdownCell revision}} | {{markdownCell target}} | {{markdownCell changeNote}} | {{markdownCell approvalDate}} | {{markdownCell approvalBy}} |
{{else}}
|  |  |  |  |  |  |  |
{{/each}}

### 4.2 Additional notes
{{#if additionalNotes}}
- {{additionalNotes}}
{{else}}
No concrete entries.
{{/if}}

## 5. Blank / N/A handling
- If no concrete values exist, write exactly: No concrete entries.
- Do not infer missing values.
- Do not add implementation assumptions.
