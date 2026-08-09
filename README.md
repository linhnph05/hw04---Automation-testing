# HW04 - Automation Testing

- Student: Nguyen Phan Hung Linh
- Student ID: 23127081
- Repository: https://github.com/linhnph05/hw04---Automation-testing
- Features: FR-03, FR-09, FR-12
- Framework: Playwright JavaScript

## Test summary

| Metric | Result |
| --- | ---: |
| Features automated | 3 |
| Test cases | 36 |
| Executions across browsers | 108 |
| Passed | 57 |
| Failed because requirements were violated | 51 |
| Feature-browser runs | 9 |
| Browser engines | Chromium, Firefox, WebKit |
| GitHub bug issues | 8 |
| Demo video | Not recorded as requested; [Vietnamese narration and recording instructions](reports/VIDEO_NARRATION_VI.md) are provided |

Every HTML report visibly contains `Run by: 23127081` and an ISO timestamp. Reports are under [`reports/html`](reports/html).

## Self-assessment

| No. | Criteria | Grade | Self-assessed |
| --- | --- | ---: | ---: |
| 1 | Task 1 - FR-03 | 25 | 25 |
| 2 | Task 1 - FR-09 | 25 | 25 |
| 3 | Task 1 - FR-12 | 25 | 25 |
| 4 | Task 2 - Demo video | 15 | 0 |
| 5 | Reusable automation skill | 10 | 10 |
|  | **Total** | **100** | **85** |

## Run instructions

1. Start the EShop backend, web frontend, and admin frontend on ports 3000, 5173, and 5174.
2. Install dependencies with `rtk npm install`.
3. Install browsers with `rtk proxy npx playwright install chromium firefox webkit`.
4. Run the nine-report matrix with `rtk npm run test:matrix`.

The matrix returns a non-zero exit code because the suite intentionally asserts the written requirements and exposes genuine SUT defects.

## Deliverables

- [Main report](reports/MAIN_REPORT.md)
- [AI audit report](reports/AI_AUDIT_REPORT.md)
- [AI critique](reports/AI_CRITIQUE.md)
- [Bug report](reports/BUG_REPORT.md)
- [Video narration](reports/VIDEO_NARRATION_VI.md)
- [Git commit log](git-commit-log.txt)
