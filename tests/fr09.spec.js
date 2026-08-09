import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const cases = JSON.parse(
  readFileSync(new URL('../test-data/fr09-cases.json', import.meta.url)),
);
const webUrl = 'http://localhost:5173';
const apiUrl = 'http://localhost:3000/api';
let fixtureCounter = 0;

function uniqueValue(prefix) {
  fixtureCounter += 1;
  return `${prefix}_${Date.now()}_${fixtureCounter}`;
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

async function login(request, email, password) {
  const response = await request.post(`${apiUrl}/login`, {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

async function createUser(request, prefix) {
  const email = `${uniqueValue(prefix)}@test.local`;
  const password = 'CouponPass1!';
  const response = await request.post(`${apiUrl}/register`, {
    data: { name: 'FR09 Test User', email, password },
  });
  expect(response.ok()).toBeTruthy();
  const { id } = await response.json();
  const session = await login(request, email, password);
  return { id, email, password, token: session.token };
}

async function adminToken(request) {
  return (await login(request, 'admin@eshop.com', 'Admin123!')).token;
}

async function cleanupUsers(request, ids) {
  if (ids.length === 0) return;
  const token = await adminToken(request);
  for (const id of ids) {
    await request.delete(`${apiUrl}/admin/users/${id}`, {
      headers: authHeaders(token),
    });
  }
}

async function applyCoupon(request, user, caseData) {
  return request.post(`${apiUrl}/apply-coupon`, {
    headers: authHeaders(user.token),
    data: {
      code: caseData.code,
      total_amount: caseData.totalAmount,
      user_id: user.id,
    },
  });
}

async function getCoupon(request, token, code) {
  const response = await request.get(`${apiUrl}/coupons`, {
    headers: authHeaders(token),
  });
  expect(response.ok()).toBeTruthy();
  const coupon = (await response.json()).find((item) => item.code === code);
  expect(coupon).toBeTruthy();
  return coupon;
}

async function recordUsage(request, token, couponId, count) {
  for (let index = 0; index < count; index += 1) {
    const response = await request.post(`${apiUrl}/coupon-usage`, {
      headers: authHeaders(token),
      data: { coupon_id: couponId },
    });
    expect(response.ok()).toBeTruthy();
  }
}

async function openCheckout(page, token) {
  await page.addInitScript((value) => localStorage.setItem('token', value), token);
  await page.goto(`${webUrl}/checkout`);
  await expect(page.getByRole('heading', { name: 'Xác Nhận Đơn Hàng' })).toBeVisible();
  await expect(page.getByText(/Chào,/)).toBeVisible();
}

async function openCheckoutAsGuest(page) {
  await page.addInitScript(() => localStorage.removeItem('token'));
  await page.goto(`${webUrl}/checkout`);
  await expect(page.getByRole('heading', { name: 'Xác Nhận Đơn Hàng' })).toBeVisible();
}

async function submitCoupon(page, totalAmount, code) {
  await page.locator('input[type="number"]').fill(String(totalAmount));
  await page.getByPlaceholder('Nhập mã giảm giá...').fill(code);
  await page.getByRole('button', { name: 'Áp dụng' }).click();
}

function formattedNumber(value) {
  return new RegExp(String(value).split('').join('[.,]?'));
}

test.describe('FR-09 Discount coupons', () => {
  for (const caseData of cases) {
    test(`${caseData.id} - ${caseData.title}`, async ({ page, request }, testInfo) => {
      const createdUserIds = [];

      if (caseData.likelyDefect) {
        testInfo.annotations.push({
          type: 'Expected SUT defect',
          description: 'This assertion follows FR-09 and may fail on the current SUT.',
        });
      }

      try {
        if (caseData.operation === 'apply_ui') {
          const user = await createUser(request, 'fr09_ui');
          createdUserIds.push(user.id);
          await openCheckout(page, user.token);
          await submitCoupon(page, caseData.totalAmount, caseData.code);
          await expect(page.getByText(/Áp dụng thành công/i)).toBeVisible();
          await expect(page.getByText(/Tiết kiệm:/i)).toContainText(
            formattedNumber(caseData.expectedDiscount),
          );
          await expect(page.getByText(/Thành tiền:/i)).toContainText(
            formattedNumber(caseData.expectedFinalAmount),
          );
        }

        if (caseData.operation === 'apply_api') {
          const user = await createUser(request, 'fr09_api');
          createdUserIds.push(user.id);
          const response = await applyCoupon(request, user, caseData);
          expect(response.status()).toBe(caseData.expectedStatus);
          const body = await response.json();
          expect(body).toMatchObject({
            success: true,
            discount_amount: caseData.expectedDiscount,
            final_amount: caseData.expectedFinalAmount,
          });
        }

        if (caseData.operation === 'reject_ui') {
          const user = await createUser(request, 'fr09_reject_ui');
          createdUserIds.push(user.id);
          await openCheckout(page, user.token);
          await submitCoupon(page, caseData.totalAmount, caseData.code);
          await expect(
            page.getByText(new RegExp(caseData.expectedErrorPattern, 'i')),
          ).toBeVisible();
          await expect(page.getByText(/Áp dụng thành công/i)).toHaveCount(0);
        }

        if (caseData.operation === 'unavailable_coupon_api') {
          const user = await createUser(request, 'fr09_unavailable');
          createdUserIds.push(user.id);
          const response = await request.post(`${apiUrl}/apply-coupon`, {
            headers: authHeaders(user.token),
            data: {
              code: uniqueValue(caseData.codePrefix),
              total_amount: caseData.totalAmount,
              user_id: user.id,
            },
          });
          expect(response.status()).toBe(caseData.expectedStatus);
          expect((await response.json()).error).toMatch(
            new RegExp(caseData.expectedErrorPattern, 'i'),
          );
        }

        if (caseData.operation === 'reject_api') {
          const user = await createUser(request, 'fr09_reject_api');
          createdUserIds.push(user.id);
          const response = await applyCoupon(request, user, caseData);
          expect(response.status()).toBe(caseData.expectedStatus);
          expect((await response.json()).error).toMatch(
            new RegExp(caseData.expectedErrorPattern, 'i'),
          );
        }

        if (caseData.operation === 'guest_rejected_ui') {
          await openCheckoutAsGuest(page);
          await submitCoupon(page, caseData.totalAmount, caseData.code);
          await expect(page).toHaveURL(/\/login$/);
          await expect(page.getByText(/Áp dụng thành công/i)).toHaveCount(0);
        }

        if (caseData.operation === 'exhausted_user_api') {
          const user = await createUser(request, 'fr09_exhausted');
          createdUserIds.push(user.id);
          const coupon = await getCoupon(request, user.token, caseData.code);
          await recordUsage(request, user.token, coupon.id, caseData.priorUsageCount);
          const response = await applyCoupon(request, user, caseData);
          expect(response.status()).toBe(caseData.expectedStatus);
          expect((await response.json()).error).toMatch(
            new RegExp(caseData.expectedErrorPattern, 'i'),
          );
        }

        if (caseData.operation === 'second_user_api') {
          const firstUser = await createUser(request, 'fr09_first');
          const secondUser = await createUser(request, 'fr09_second');
          createdUserIds.push(firstUser.id, secondUser.id);
          const coupon = await getCoupon(request, firstUser.token, caseData.code);
          await recordUsage(
            request,
            firstUser.token,
            coupon.id,
            caseData.firstUserUsageCount,
          );
          const response = await applyCoupon(request, secondUser, caseData);
          expect(response.status()).toBe(caseData.expectedStatus);
          expect(await response.json()).toMatchObject({
            discount_amount: caseData.expectedDiscount,
            final_amount: caseData.expectedFinalAmount,
          });
        }

        if (caseData.operation === 'spoofed_user_api') {
          const authenticatedUser = await createUser(request, 'fr09_authenticated');
          const secondUser = await createUser(request, 'fr09_spoof_target');
          createdUserIds.push(authenticatedUser.id, secondUser.id);
          const coupon = await getCoupon(
            request,
            authenticatedUser.token,
            caseData.code,
          );
          await recordUsage(
            request,
            authenticatedUser.token,
            coupon.id,
            caseData.authenticatedUserUsageCount,
          );
          const response = await request.post(`${apiUrl}/apply-coupon`, {
            headers: authHeaders(authenticatedUser.token),
            data: {
              code: caseData.code,
              total_amount: caseData.totalAmount,
              user_id: secondUser.id,
            },
          });
          expect(response.status()).toBe(caseData.expectedStatus);
          expect((await response.json()).error).toMatch(
            new RegExp(caseData.expectedErrorPattern, 'i'),
          );
        }
      } finally {
        await cleanupUsers(request, createdUserIds);
      }
    });
  }
});
