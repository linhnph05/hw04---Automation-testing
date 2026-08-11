---
name: playwright-automation-workflow
description: Build, review, execute, and document data-driven Playwright web-test suites across Chromium, Firefox, and WebKit. Use when a task requires external JSON/CSV test data, requirement-based UI and API assertions, attributable HTML reports, AI-draft review, defect evidence, or a repeatable feature-by-browser test matrix.
---

# Playwright Automation Workflow

Use this workflow to turn written web requirements into reviewable multi-browser evidence without changing the system under test.

## 1. Establish the test contract

1. Read the written requirements and identify the exact feature boundaries.
2. Inspect routes, UI controls, API contracts, credentials, and fixture constraints.
3. Keep expected results based on requirements, even when source inspection predicts a failure.
4. List any state that cannot be created through supported UI or API setup. Do not fake unavailable fixtures.

## 2. Design data before code

1. Give every case a stable ID and one primary purpose.
2. Include positive, negative, boundary, and security cases where relevant.
3. Store inputs and expected results in external JSON or CSV files.
4. Define setup and cleanup for every stateful case.
5. Avoid combining independent requirements merely to reduce setup.

Use a small schema that maps directly to the test flow. Extend it only when the feature needs more fields:

```json
{
  "id": "FR00-TC-01",
  "title": "requirement-focused title",
  "type": "positive|negative|edge|security",
  "operation": "stable_branch_name",
  "input": {},
  "expectedStatus": 200,
  "expectedMessagePattern": "string",
  "likelyDefect": false
}
```

## 3. Generate and review feature drafts incrementally

Request or write one feature draft at a time. Before accepting it:

- Match the repository module format and coding style.
- Prefer role, label, placeholder, or test-ID locators.
- Reject page-wide text matches that can hit permanent navigation content.
- Use web-first assertions instead of fixed sleeps.
- Derive authenticated identity from tokens rather than copying insecure body fields.
- Record created IDs before requirement assertions so cleanup still runs after failures.
- Verify important side effects, not only HTTP status codes.

Run a small single-browser baseline after each feature. Correct test bugs before adding more coverage.

## 4. Configure the browser matrix

Define Chromium, Firefox, and WebKit projects. Use one worker when the SUT has shared mutable state unless isolated fixtures support safe parallelism.

Create one HTML report for each feature-browser pair. Put the required student or runner marker and a fresh ISO timestamp in the visible report title. Use separate output folders so later runs do not overwrite earlier evidence.

Configure the reporter with a dynamic title and environment-selected folders:

```javascript
['html', {
  open: 'never',
  outputFolder: process.env.REPORT_DIR,
  title: `Run by: ${runnerId} | ${new Date().toISOString()}`,
}]
```

Run each pair independently, even when a previous pair fails:

```bash
REPORT_DIR=reports/html/fr00-chromium \
RESULTS_DIR=test-results/fr00-chromium \
npx playwright test tests/fr00.spec.js --project chromium
```

Repeat for Firefox and WebKit. A matrix wrapper must record a failed exit status but continue the remaining runs.

## 5. Execute from clean state

1. Seed or reset the SUT through its supported setup process.
2. Run every feature against every browser project.
3. Continue the matrix after requirement failures so all reports are produced.
4. Confirm the expected number of report directories and test executions.
5. Open each report in a real browser and verify the visible runner marker and timestamp.

Automated Playwright inspection is acceptable for this visual check when it renders the report, reads visible body text after the client application loads, and saves a screenshot. Do not treat a source-file string search as visual verification.

Treat consistent cross-browser requirement failures as defect candidates. Investigate browser-only differences as possible compatibility or automation problems.

## 6. Produce evidence and review records

For each distinct root cause:

1. Record requirement, reproduction steps, expected behavior, actual behavior, and affected case IDs.
2. Attach a real report or failure screenshot.
3. Avoid duplicate issues for the same defect across browsers.

Use `screenshot: 'only-on-failure'` and `trace: 'retain-on-failure'`. Keep official HTML reports under `reports/html/<feature>-<browser>/` and selected issue screenshots under `images/`. Name images by feature and browser.

Document the AI workflow chronologically with tool name, ISO time and timezone, prompt, output, mistakes found, and human corrections. If the platform does not expose per-message time, say that and label nearby times as approximate. State automation gaps and unmet administrative requirements honestly; never fabricate execution, video, timestamps, or Git dates.

## Completion checks

- External data files contain the requested number of cases.
- At least three assertion patterns are present, such as visibility/count, exact status/value, text/regex, URL, object structure, or negative state checks.
- Every feature ran on all required browsers.
- Each report visibly contains runner identity and ISO time.
- Failures are classified as SUT defects, automation defects, or environment problems.
- Human review changes are explained.
- Reports, bug evidence, audit log, and truthful Git log are ready for submission.
