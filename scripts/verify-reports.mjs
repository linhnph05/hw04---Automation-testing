import { readdirSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const reportsRoot = resolve('reports/html');
const evidenceRoot = resolve('evidence');
const reportNames = readdirSync(reportsRoot).sort();
const marker = 'Run by: 23127081';
const isoTimestamp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;

mkdirSync(evidenceRoot, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const reportName of reportNames) {
  const indexPath = resolve(reportsRoot, reportName, 'index.html');
  await page.goto(pathToFileURL(indexPath).href);
  await page.waitForTimeout(500);
  const body = await page.locator('body').innerText();
  const pageTitle = await page.title();
  const hasMarker = body.includes(marker);
  const hasTimestamp = isoTimestamp.test(body);
  console.log(
    `${reportName}: marker=${hasMarker}, timestamp=${hasTimestamp}, title=${pageTitle}`,
  );

  if (!hasMarker || !hasTimestamp) {
    throw new Error(`Missing report evidence in ${reportName}`);
  }

  if (reportName.endsWith('-chromium')) {
    await page.screenshot({
      path: resolve(evidenceRoot, `${reportName}-report.png`),
      fullPage: true,
    });
  }
}

await browser.close();
