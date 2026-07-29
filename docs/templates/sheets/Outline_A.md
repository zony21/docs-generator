# Outline_A

## 1. Document metadata
- Package name: {{packageName}}
- Document type: Outline_A
- Output file: sheets/Outline_A.md
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

### 4.1 System/module purpose
{{#if purpose}}
{{purpose}}
{{else}}
No concrete entries.
{{/if}}

### 4.2 Scope and target users/process
{{#if scope}}
{{scope}}
{{else}}
No concrete entries.
{{/if}}

### 4.3 High-level operation flow
{{#each operationFlow}}
{{number @index}}. {{this}}
{{else}}
No concrete entries.
{{/each}}

### 4.4 Preconditions/postconditions
- Preconditions: {{orDash preconditions}}
- Postconditions: {{orDash postconditions}}

## 5. Blank / N/A handling
- If no concrete values exist, write exactly: No concrete entries.
- Do not infer missing values.
- Do not add implementation assumptions.
