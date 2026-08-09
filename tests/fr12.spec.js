import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const cases = JSON.parse(
  readFileSync(new URL('../test-data/fr12-cases.json', import.meta.url)),
);
const adminWebUrl = 'http://localhost:5174';
const apiUrl = 'http://localhost:3000/api';

function uniqueValue(prefix) {
  return `${prefix}_${Date.now()}`;
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function loginApi(request, email, password) {
  const response = await request.post(`${apiUrl}/login`, {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

async function headersForActor(request, actor) {
  if (actor === 'admin') {
    return authHeaders((await loginApi(request, 'admin@eshop.com', 'Admin123!')).token);
  }
  if (actor === 'user') {
    return authHeaders((await loginApi(request, 'test@eshop.com', 'Test1234!')).token);
  }
  if (actor === 'invalidToken') {
    return authHeaders('invalid.header.payload.signature');
  }
  return {};
}

async function sendRequest(request, caseData, headers) {
  return request.fetch(`${apiUrl}${caseData.path}`, {
    method: caseData.method,
    headers,
    data: caseData.body,
  });
}

async function openCleanAdminLogin(page) {
  await page.addInitScript(() => localStorage.removeItem('adminToken'));
  await page.goto(adminWebUrl);
  await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
}

async function fillAdminLogin(page, email, password) {
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
}

function nextDialogMessage(page) {
  return new Promise((resolve) => {
    page.once('dialog', async (dialog) => {
      const message = dialog.message();
      await dialog.accept();
      resolve(message);
    });
  });
}

async function cleanupCreatedData(request, createdData) {
  const hasFixtures = Object.values(createdData).some((ids) => ids.length > 0);
  if (!hasFixtures) return;
  const headers = await headersForActor(request, 'admin');

  for (const id of createdData.couponIds) {
    await request.delete(`${apiUrl}/admin/coupons/${id}`, { headers });
  }
  for (const id of createdData.productIds) {
    await request.delete(`${apiUrl}/products/${id}`, { headers });
  }
  for (const id of createdData.categoryIds) {
    await request.delete(`${apiUrl}/categories/${id}`, { headers });
  }
}

test.describe('FR-12 Admin access control', () => {
  for (const caseData of cases) {
    test(`${caseData.id} - ${caseData.title}`, async ({ page, request }) => {
      const createdData = { couponIds: [], productIds: [], categoryIds: [] };

      try {
      if (caseData.operation === 'admin_login_ui') {
        await openCleanAdminLogin(page);
        await fillAdminLogin(page, caseData.email, caseData.password);
        await page.getByRole('button', { name: 'Login' }).click();
        await expect(page.getByRole('heading', { name: 'EShop Admin' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
        expect(await page.evaluate(() => localStorage.getItem('adminToken'))).toBeTruthy();
      }

      if (caseData.operation === 'user_login_ui') {
        await openCleanAdminLogin(page);
        await fillAdminLogin(page, caseData.email, caseData.password);
        const dialogMessage = nextDialogMessage(page);
        await page.getByRole('button', { name: 'Login' }).click();
        expect(await dialogMessage).toMatch(
          new RegExp(caseData.expectedAlertPattern, 'i'),
        );
        await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
        expect(await page.evaluate(() => localStorage.getItem('adminToken'))).toBeNull();
      }

      if (caseData.operation === 'authorized_get') {
        const headers = await headersForActor(request, caseData.actor);
        const response = await sendRequest(request, caseData, headers);
        expect(response.status()).toBe(caseData.expectedStatus);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
      }

      if (caseData.operation === 'denied_request') {
        const headers = await headersForActor(request, caseData.actor);
        const response = await sendRequest(request, caseData, headers);
        expect(response.status()).toBe(caseData.expectedStatus);
      }

      if (caseData.operation === 'denied_coupon_create') {
        const headers = await headersForActor(request, caseData.actor);
        const response = await request.post(`${apiUrl}${caseData.path}`, {
          headers,
          data: {
            code: uniqueValue('SEC_COUPON'),
            type: 'fixed',
            discount_value: 10000,
            min_order_amount: 100000,
            expired_at: '2099-12-31',
            max_uses_per_user: 1,
          },
        });
        const body = await response.json().catch(() => ({}));
        if (response.ok() && body.id) createdData.couponIds.push(body.id);
        expect(response.status()).toBe(caseData.expectedStatus);
      }

      if (caseData.operation === 'denied_product_create') {
        const headers = await headersForActor(request, caseData.actor);
        const response = await request.post(`${apiUrl}${caseData.path}`, {
          headers,
          data: {
            name: uniqueValue('SEC_PRODUCT'),
            price: 100000,
            description: 'Unauthorized security fixture',
            imageUrl: '',
            category_id: 1,
          },
        });
        const body = await response.json().catch(() => ({}));
        if (response.ok() && body.id) createdData.productIds.push(body.id);
        expect(response.status()).toBe(caseData.expectedStatus);
      }

      if (caseData.operation === 'denied_category_create') {
        const headers = await headersForActor(request, caseData.actor);
        const response = await request.post(`${apiUrl}${caseData.path}`, {
          headers,
          data: { name: uniqueValue('SEC_CATEGORY') },
        });
        const body = await response.json().catch(() => ({}));
        if (response.ok() && body.id) createdData.categoryIds.push(body.id);
        expect(response.status()).toBe(caseData.expectedStatus);
      }
      } finally {
        await cleanupCreatedData(request, createdData);
      }
    });
  }
});
