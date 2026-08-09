import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const cases = JSON.parse(
  readFileSync(new URL('../test-data/fr09-cases.json', import.meta.url)),
);
const webUrl = 'http://localhost:5173';
const apiUrl = 'http://localhost:3000/api';

function uniqueValue(prefix) {
  return `${prefix}_${Date.now()}`;
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

async function openCheckout(page, token) {
  await page.addInitScript((value) => localStorage.setItem('token', value), token);
  await page.goto(`${webUrl}/checkout`);
  await expect(page.getByRole('heading', { name: 'Xác Nhận Đơn Hàng' })).toBeVisible();
  await expect(page.getByText(/Chào,/)).toBeVisible();
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
    test(`${caseData.id} - ${caseData.title}`, async ({ page, request }) => {
      const createdUserIds = [];

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
      } finally {
        await cleanupUsers(request, createdUserIds);
      }
    });
  }
});
