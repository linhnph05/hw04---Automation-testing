import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const cases = JSON.parse(
  readFileSync(new URL('../test-data/fr12-cases.json', import.meta.url)),
);
const adminWebUrl = 'http://localhost:5174';
const apiUrl = 'http://localhost:3000/api';

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

test.describe('FR-12 Admin access control', () => {
  for (const caseData of cases) {
    test(`${caseData.id} - ${caseData.title}`, async ({ page, request }) => {
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
    });
  }
});
