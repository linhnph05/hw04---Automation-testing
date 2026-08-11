## Requirement

Every `/api/admin/*` endpoint requires both a valid JWT and `role = admin`.

## Steps to reproduce

1. Log in as `test@eshop.com`.
2. Send its JWT to `GET /api/admin/users`, `GET /api/admin/orders`, or the admin coupon write endpoints.

## Expected

Every request returns HTTP 403 and no admin data is exposed or changed.

## Actual

The normal-user token receives HTTP 200, reads admin data, and can create/delete coupons. Reproduced by `FR12-TC-06` through `FR12-TC-09` on all three browser projects.

![FR-12 Playwright report](https://raw.githubusercontent.com/linhnph05/hw04---Automation-testing/main/images/fr12-chromium-report.png)
