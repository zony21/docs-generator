# Check

## 1. Document metadata
- Package name: {{packageName}}
- Document type: Check
- Output file: sheets/Check.md
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

### 4.1 Validation target context
- Screen name: {{orDash context.screenName}}
- Check name: {{orDash context.checkName}}
- Timing/trigger: {{orDash context.timingOrTrigger}}

### 4.2 Validation table
| No. | Check Item | Type | Detail | Message ID | Message Arguments |
| --- | --- | --- | --- | --- | --- |
{{#each checks}}
| {{number @index}} | {{markdownCell item}} | {{markdownCell type}} | {{markdownCell detail}} | {{markdownCell messageId}} | {{markdownCell messageArguments}} |
{{else}}
|  |  |  |  |  |  |
{{/each}}

## 5. Blank / N/A handling
- Keep the table frame even when details are blank.
- Preserve empty rows or columns when they represent required template structure.
- If no concrete values exist, write exactly: No concrete entries.
- Do not infer missing values.
- Do not add implementation assumptions.
