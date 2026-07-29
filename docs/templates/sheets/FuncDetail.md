# FuncDetail

## 1. Document metadata
- Package name: {{packageName}}
- Document type: FuncDetail
- Output file: sheets/FuncDetail.md
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
{{#each processingUnits}}

### 4.{{number @index}} Processing unit
- Process name: {{orDash processName}}
- Function/method name: {{orDash functionName}}
- Function type: {{orDash functionType}}
- Summary: {{orDash summary}}

#### Internal flow
{{#if trySteps}}
##### try
{{#each trySteps}}
- {{this}}
{{/each}}
{{/if}}
{{#if catchSteps}}

##### catch
{{#each catchSteps}}
- {{this}}
{{/each}}
{{/if}}
{{#if finallySteps}}

##### finally
{{#each finallySteps}}
- {{this}}
{{/each}}
{{/if}}
{{#if internalSteps}}

##### processing steps
{{#each internalSteps}}
{{number @index}}. {{this}}
{{/each}}
{{/if}}

#### Cross references
{{#each crossReferences}}
- {{label}}: [{{fileName}}]({{relativePath}})
{{else}}
No concrete entries.
{{/each}}
{{else}}

No concrete entries.
{{/each}}

## 5. Blank / N/A handling
- Output try / catch / finally blocks only when concrete entries exist.
- Output links only for selected documents.
- If no concrete values exist, write exactly: No concrete entries.
- Do not infer missing values.
- Do not add implementation assumptions.
