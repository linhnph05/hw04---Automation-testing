## Requirement

FR-03 accepts a password of at least eight characters containing uppercase, lowercase, digit, and an allowed special character such as `!`.

## Steps to reproduce

1. Request an OTP for a registered account.
2. Enter the correct OTP.
3. Enter `NewPass1!` as the new password.
4. Submit the reset form.

## Expected

The password is reset and the user can log in with `NewPass1!`.

## Actual

The UI reports that the valid password is weak and remains on the reset page. Reproduced by `FR03-TC-05` on all three browsers.

![FR-03 Playwright report](https://raw.githubusercontent.com/linhnph05/hw04---Automation-testing/main/evidence/fr03-chromium-report.png)
