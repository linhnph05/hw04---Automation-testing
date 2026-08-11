## Requirement

Product data-changing APIs require a valid admin JWT.

## Steps to reproduce

1. Send `POST /api/products` without an Authorization header.
2. Send `PUT /api/products/999999` without an Authorization header.

## Expected

Both requests return HTTP 401 before processing product data.

## Actual

Both endpoints return HTTP 200. The POST request creates a product without authentication. Reproduced by `FR12-TC-10` and `FR12-TC-11` on all three browser projects.

![FR-12 Playwright report](https://raw.githubusercontent.com/linhnph05/hw04---Automation-testing/main/images/fr12-chromium-report.png)
