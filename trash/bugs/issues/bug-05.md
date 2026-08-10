## Requirement

A coupon is valid when the order total is greater than or equal to its minimum amount.

## Steps to reproduce

1. Log in as a user.
2. Apply `BIGBUY` to an order total of exactly `500,000 ₫`.

## Expected

The coupon is accepted and the final amount is `450,000 ₫`.

## Actual

The API returns HTTP 400 and says the total is below the minimum. Reproduced by `FR09-TC-08` on all three browser projects.

![FR-09 Playwright report](https://raw.githubusercontent.com/linhnph05/hw04---Automation-testing/main/evidence/fr09-chromium-report.png)
