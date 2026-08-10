# Human-Readable Test Case Specification

**Student:** Nguyen Phan Hung Linh  
**Student ID:** 23127081  
**Features:** FR-03, FR-09, FR-12  
**Total:** 36 test cases

This file lists the 36 test cases in a readable format. Playwright uses the matching data in `test-data/fr03-cases.json`, `test-data/fr09-cases.json`, and `test-data/fr12-cases.json`. Expected results follow the requirements, even when the current SUT is wrong.

## FR-03 - Forgot password and password reset

Setup: The EShop API and customer web application are running. Tests that need an account create a unique user before execution and delete it afterward.

| ID | Preconditions and input | Test actions | Expected result |
| --- | --- | --- | --- |
| FR03-TC-01 | Registered user with password `OldPass1!` | Open Forgot Password, enter the registered email, and request an OTP. | A six-digit OTP matching `^\d{6}$` is displayed. |
| FR03-TC-02 | Forgot Password page is available | Open the page and inspect the first step and navigation controls. | `Bước 1 / 2` is visible and `Quay lại đăng nhập` links to `/login`. |
| FR03-TC-03 | Email `missing-fr03@test.local` is not registered | Send the email to `POST /api/forgot-password`. | Status `404` and an error saying the user does not exist. |
| FR03-TC-04 | Malformed email `not-an-email` | Enter the value in the email field and check form validity. | The field uses email validation and the malformed value is invalid. |
| FR03-TC-05 | Old password `OldPass1!`; new password `NewPass1!` | Request the OTP, submit it with matching password fields, then try both passwords through login. | The browser goes to `/login`; the old password fails and the new password succeeds. |
| FR03-TC-06 | New password `newpass1!` has no uppercase letter | Request an OTP and submit the weak password with matching confirmation. | Reset is rejected; the old password works and the new one does not. |
| FR03-TC-07 | New password `NEWPASS1!` has no lowercase letter | Request an OTP and submit the weak password with matching confirmation. | Reset is rejected; the old password works and the new one does not. |
| FR03-TC-08 | New password `NewPassword!` has no digit | Request an OTP and submit the weak password with matching confirmation. | Reset is rejected; the old password works and the new one does not. |
| FR03-TC-09 | New password `NewPass12` has no special character | Request an OTP and submit the weak password with matching confirmation. | Reset is rejected; the old password works and the new one does not. |
| FR03-TC-10 | Password `NewPass1!`; confirmation `OtherPass1!` | Request an OTP, enter different password values, and submit. | Two password fields are available; reset is rejected and the old password remains valid. |
| FR03-TC-11 | Registered user with issued OTP; incorrect OTP `000000` | Send the incorrect OTP and `NewPass1!` to `POST /api/reset-password`. | Status `400` and the old password remains valid. |
| FR03-TC-12 | Two users; obtain an OTP for the first user | Submit the first user's OTP to reset the second user's password. | Status `400`; neither account password is changed. |

## FR-09 - Discount coupons

Setup: Seed coupons are available. Authenticated cases create unique users and delete them afterward. Amounts are in VND.

| ID | Preconditions and input | Test actions | Expected result |
| --- | --- | --- | --- |
| FR09-TC-01 | Authenticated user; `SAVE10`; total `400000` | Enter the total and coupon at Checkout, then apply it. | Success is shown; discount is `40000` and final amount is `360000`. |
| FR09-TC-02 | Authenticated user; `BIGBUY`; total `600000` | Send the coupon and total to `POST /api/apply-coupon`. | Status `200`; discount is `50000` and final amount is `550000`. |
| FR09-TC-03 | User has remaining uses; `VIP100`; total `400000` | Apply the coupon through the API. | Status `200`; discount is `100000` and final amount is `300000`. |
| FR09-TC-04 | Code `DOESNOTEXIST`; total `600000` | Apply the unknown code at Checkout. | A not-found or disabled message appears and no success message appears. |
| FR09-TC-05 | Empty code; total `600000` | Submit the empty code through the API. | Status `400` with `Vui lòng nhập mã giảm giá`. |
| FR09-TC-06 | Expired code `EXPIRED`; total `600000` | Apply the expired code at Checkout. | An expired-coupon message appears and no success message appears. |
| FR09-TC-07 | `BIGBUY`; total `499999` | Apply the coupon one VND below its minimum. | Status `400` with a minimum-order error. |
| FR09-TC-08 | `BIGBUY`; total exactly `500000` | Apply the coupon at its exact minimum. | Status `200`; discount is `50000` and final amount is `450000`. |
| FR09-TC-09 | Guest; `BIGBUY`; total `600000` | Open Checkout without a token and apply the coupon. | Redirect to `/login` and no success message. |
| FR09-TC-10 | User has used `SAVE10` once | Record one use and apply `SAVE10` again to total `400000`. | Status `400` with a usage-limit error. |
| FR09-TC-11 | First user exhausted `SAVE10`; second user has no usage | Apply `SAVE10` as the second user. | Status `200` and success is true because limits are isolated per user. |
| FR09-TC-12 | Authenticated user exhausted `SAVE10`; another user ID exists | Authenticate as the exhausted user but submit the other user ID in the body. | Status `400`; the body ID cannot override JWT identity. |

## FR-12 - Admin access control

Setup: The backend and admin frontend are running. Admin credentials are `admin@eshop.com` / `Admin123!`; normal-user credentials are `test@eshop.com` / `Test1234!`. Tests check that blocked data is not saved. They delete any data that the faulty SUT saves.

| ID | Preconditions and input | Test actions | Expected result |
| --- | --- | --- | --- |
| FR12-TC-01 | Valid admin credentials | Log in through the admin frontend. | `EShop Admin` and `Dashboard` are visible and an admin token is stored. |
| FR12-TC-02 | Valid normal-user credentials | Attempt to log in through the admin frontend. | A not-admin warning appears, Admin Login remains visible, and no admin token is stored. |
| FR12-TC-03 | Valid admin token | Send `GET /api/admin/users`. | Status `200` with a non-empty user array. |
| FR12-TC-04 | No token | Send `GET /api/admin/users`. | Status `401` and no user array is disclosed. |
| FR12-TC-05 | Invalid bearer token | Send `GET /api/admin/users`. | Status `403` and no user array is disclosed. |
| FR12-TC-06 | Valid normal-user token | Send `GET /api/admin/users`. | Status `403` and no user array is disclosed. |
| FR12-TC-07 | Valid normal-user token | Send `GET /api/admin/orders`. | Status `403` and no order array is disclosed. |
| FR12-TC-08 | Normal-user token; unique coupon data | Send `POST /api/admin/coupons`, then query coupons as admin. | Status `403` and the coupon is not stored. |
| FR12-TC-09 | Valid normal-user token | Send `DELETE /api/admin/coupons/999999`. | Status `403`; normal users cannot invoke admin coupon deletion. |
| FR12-TC-10 | Guest; unique product data | Send `POST /api/products`, then query products. | Status `401` and the product is not stored. |
| FR12-TC-11 | Guest; product ID `999999` and update body | Send `PUT /api/products/999999`. | Status `401`; an unauthenticated caller cannot update a product. |
| FR12-TC-12 | Normal-user token; unique category data | Send `POST /api/categories`, then query categories. | Status `403` and the category is not stored. |
