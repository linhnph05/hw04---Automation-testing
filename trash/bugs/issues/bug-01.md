## Requirement

FR-03 requires a random OTP containing exactly six digits.

## Steps to reproduce

1. Open `http://localhost:5173/forgot-password`.
2. Enter a registered email.
3. Click **Lấy mã OTP**.
4. Read the OTP displayed on screen.

## Expected

The OTP contains six digits.

## Actual

The application generates and displays a four-digit OTP. Reproduced in Chromium, Firefox, and WebKit by `FR03-TC-01`.

![FR-03 Playwright report](https://raw.githubusercontent.com/linhnph05/hw04---Automation-testing/main/images/fr03-chromium-report.png)
