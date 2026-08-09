import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const cases = JSON.parse(
  readFileSync(new URL('../test-data/fr03-cases.json', import.meta.url)),
);
const webUrl = 'http://localhost:5173';
const apiUrl = 'http://localhost:3000/api';

function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}@test.local`;
}

async function registerUser(request, email, password) {
  const response = await request.post(`${apiUrl}/register`, {
    data: { name: 'FR03 Test User', email, password },
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).id;
}

async function login(request, email, password) {
  return request.post(`${apiUrl}/login`, { data: { email, password } });
}

async function requestOtp(request, email) {
  const response = await request.post(`${apiUrl}/forgot-password`, {
    data: { email },
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).resetToken;
}

async function cleanupUsers(request, userIds) {
  if (userIds.length === 0) return;
  const loginResponse = await login(request, 'admin@eshop.com', 'Admin123!');
  if (!loginResponse.ok()) return;
  const { token } = await loginResponse.json();

  for (const id of userIds) {
    await request.delete(`${apiUrl}/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

async function openForgotPassword(page) {
  await page.goto(`${webUrl}/forgot-password`);
  await expect(page.getByRole('heading', { name: 'Quên Mật Khẩu' })).toBeVisible();
}

async function requestOtpThroughUi(page, email) {
  await openForgotPassword(page);
  await page.getByRole('textbox').first().fill(email);
  await page.getByRole('button', { name: 'Lấy mã OTP' }).click();
  const message = page.getByText(/Mã OTP của bạn là:/i);
  await expect(message).toBeVisible();
  return (await message.textContent()).match(/\d+/)?.[0] || '';
}

async function fillResetForm(page, otp, password, confirmation) {
  await page.getByRole('textbox').first().fill(otp);
  const passwordInputs = page.locator('input[type="password"]');
  await passwordInputs.first().fill(password);
  if ((await passwordInputs.count()) > 1) {
    await passwordInputs.nth(1).fill(confirmation);
  }
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

test.describe('FR-03 Forgot and reset password', () => {
  for (const caseData of cases) {
    test(`${caseData.id} - ${caseData.title}`, async ({ page, request }, testInfo) => {
      const createdUserIds = [];

      if (caseData.likelyDefect) {
        testInfo.annotations.push({
          type: 'Expected SUT defect',
          description: 'This assertion follows FR-03 and may fail on the current SUT.',
        });
      }

      try {
        if (caseData.operation === 'request_otp_ui') {
          const email = uniqueEmail(caseData.emailPrefix);
          createdUserIds.push(await registerUser(request, email, caseData.password));
          await openForgotPassword(page);
          await expect.soft(page.getByText(/Bước 1\s*\/\s*2/i)).toBeVisible();
          await page.getByRole('textbox').first().fill(email);
          await page.getByRole('button', { name: 'Lấy mã OTP' }).click();
          await expect.soft(page.getByText(/Bước 2\s*\/\s*2/i)).toBeVisible();
          const message = await page.getByText(/Mã OTP của bạn là:/i).textContent();
          expect(message.match(/\d+/)?.[0] || '').toMatch(
            new RegExp(caseData.expectedOtpPattern),
          );
        }

        if (caseData.operation === 'inspect_step_one_ui') {
          await openForgotPassword(page);
          await expect(page.getByText(/Bước 1\s*\/\s*2/i)).toBeVisible();
          const backLink = page.getByRole('link', {
            name: new RegExp(caseData.expectedBackText, 'i'),
          });
          await expect(backLink).toBeVisible();
          await expect(backLink).toHaveAttribute('href', /\/login$/);
        }

        if (caseData.operation === 'request_unknown_api') {
          const response = await request.post(`${apiUrl}/forgot-password`, {
            data: { email: caseData.email },
          });
          expect(response.status()).toBe(404);
          expect((await response.json()).error).toMatch(
            new RegExp(caseData.expectedErrorPattern, 'i'),
          );
        }

        if (caseData.operation === 'invalid_email_ui') {
          await openForgotPassword(page);
          const emailInput = page.getByRole('textbox').first();
          expect(await emailInput.getAttribute('type')).toBe('email');
          await emailInput.fill(caseData.email);
          expect(await emailInput.evaluate((element) => element.checkValidity())).toBe(false);
        }

        if (caseData.operation === 'reset_success_ui') {
          const email = uniqueEmail(caseData.emailPrefix);
          createdUserIds.push(await registerUser(request, email, caseData.oldPassword));
          const otp = await requestOtpThroughUi(page, email);
          await fillResetForm(page, otp, caseData.newPassword, caseData.confirmPassword);
          const dialogMessage = nextDialogMessage(page);
          await page.getByRole('button', { name: 'Đặt lại mật khẩu' }).click();
          expect(await dialogMessage).toMatch(/thành công/i);
          await expect(page).toHaveURL(/\/login$/);
          expect((await login(request, email, caseData.oldPassword)).status()).toBe(401);
          expect((await login(request, email, caseData.newPassword)).ok()).toBeTruthy();
        }

        if (caseData.operation === 'reset_weak_ui') {
          const email = uniqueEmail(caseData.emailPrefix);
          createdUserIds.push(await registerUser(request, email, caseData.oldPassword));
          const otp = await requestOtpThroughUi(page, email);
          await fillResetForm(page, otp, caseData.newPassword, caseData.confirmPassword);
          const dialogMessage = nextDialogMessage(page);
          await page.getByRole('button', { name: 'Đặt lại mật khẩu' }).click();
          expect(await dialogMessage).toMatch(/quá yếu/i);
          await expect(page).toHaveURL(/\/forgot-password$/);
          expect((await login(request, email, caseData.oldPassword)).ok()).toBeTruthy();
          expect((await login(request, email, caseData.newPassword)).status()).toBe(401);
        }

        if (caseData.operation === 'reset_mismatch_ui') {
          const email = uniqueEmail(caseData.emailPrefix);
          createdUserIds.push(await registerUser(request, email, caseData.oldPassword));
          const otp = await requestOtpThroughUi(page, email);
          const passwordInputs = page.locator('input[type="password"]');
          expect(await passwordInputs.count()).toBe(2);
          await page.getByRole('textbox').first().fill(otp);
          await passwordInputs.first().fill(caseData.newPassword);
          await passwordInputs.nth(1).fill(caseData.confirmPassword);
          await page.getByRole('button', { name: 'Đặt lại mật khẩu' }).click();
          await expect(page).toHaveURL(/\/forgot-password$/);
          expect((await login(request, email, caseData.oldPassword)).ok()).toBeTruthy();
        }

        if (caseData.operation === 'wrong_otp_api') {
          const email = uniqueEmail(caseData.emailPrefix);
          createdUserIds.push(await registerUser(request, email, caseData.oldPassword));
          await requestOtp(request, email);
          const response = await request.post(`${apiUrl}/reset-password`, {
            data: {
              email,
              resetToken: caseData.resetToken,
              newPassword: caseData.newPassword,
            },
          });
          expect(response.status()).toBe(caseData.expectedStatus);
          expect((await login(request, email, caseData.oldPassword)).ok()).toBeTruthy();
        }

        if (caseData.operation === 'cross_email_otp_api') {
          const firstEmail = uniqueEmail(caseData.firstEmailPrefix);
          const secondEmail = uniqueEmail(caseData.secondEmailPrefix);
          createdUserIds.push(await registerUser(request, firstEmail, caseData.oldPassword));
          createdUserIds.push(await registerUser(request, secondEmail, caseData.oldPassword));
          const firstOtp = await requestOtp(request, firstEmail);
          const response = await request.post(`${apiUrl}/reset-password`, {
            data: {
              email: secondEmail,
              resetToken: firstOtp,
              newPassword: caseData.newPassword,
            },
          });
          expect(response.status()).toBe(caseData.expectedStatus);
          expect((await login(request, firstEmail, caseData.oldPassword)).ok()).toBeTruthy();
          expect((await login(request, secondEmail, caseData.oldPassword)).ok()).toBeTruthy();
        }
      } finally {
        await cleanupUsers(request, createdUserIds);
      }
    });
  }
});
