## Requirement

For a percent coupon, `discount = total × discount_value / 100`.

## Steps to reproduce

1. Log in and open checkout.
2. Use a total of `400,000 ₫`.
3. Apply `SAVE10`.

## Expected

Discount is `40,000 ₫`; final amount is `360,000 ₫`.

## Actual

The UI displays a negative `-3,600,000 ₫` saving and a `4,000,000 ₫` final amount. Reproduced by `FR09-TC-01` on all three browsers.

![FR-09 Playwright report](https://raw.githubusercontent.com/linhnph05/hw04---Automation-testing/main/images/fr09-chromium-report.png)
