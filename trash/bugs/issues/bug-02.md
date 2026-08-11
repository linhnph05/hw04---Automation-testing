## Requirement

FR-03 and the general form requirements require a visible step indicator, a route back to login, and password confirmation in the two-step reset flow.

## Steps to reproduce

1. Open the forgot-password page.
2. Inspect step one.
3. Request an OTP and inspect step two.

## Expected

The page shows `Bước 1 / 2` or `Bước 2 / 2`, provides **Quay lại đăng nhập**, and asks for password confirmation.

## Actual

No step indicator or login link is shown, and step two contains only one password field. Reproduced by `FR03-TC-02` and `FR03-TC-10` on all three browsers.

![FR-03 Playwright report](https://raw.githubusercontent.com/linhnph05/hw04---Automation-testing/main/images/fr03-chromium-report.png)
