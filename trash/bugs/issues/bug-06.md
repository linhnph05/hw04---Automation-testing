## Requirement

Applying a coupon requires a valid JWT, and the server must derive the user identity from that token when enforcing usage limits.

## Steps to reproduce

1. Open checkout as a guest and apply `BIGBUY`, or authenticate as user A.
2. Exhaust user A's `SAVE10` usage.
3. Submit a body containing user B's ID.

## Expected

The guest request is rejected. User A cannot bypass the limit by changing a body field.

## Actual

Guest coupon application succeeds. The backend also trusts `user_id` from the request body and allows the limit to be bypassed. Reproduced by `FR09-TC-09`, `FR09-TC-10`, and `FR09-TC-12`.

![FR-09 Playwright report](https://raw.githubusercontent.com/linhnph05/hw04---Automation-testing/main/images/fr09-chromium-report.png)
