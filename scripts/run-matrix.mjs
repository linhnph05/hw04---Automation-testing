import { spawnSync } from 'node:child_process';

const features = ['fr03', 'fr09', 'fr12'];
const browsers = ['chromium', 'firefox', 'webkit'];
let hasFailure = false;

for (const feature of features) {
  for (const browser of browsers) {
    const label = `${feature}-${browser}`;
    const result = spawnSync(
      'npx',
      ['playwright', 'test', `tests/${feature}.spec.js`, '--project', browser],
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          REPORT_DIR: `reports/html/${label}`,
          RESULTS_DIR: `test-results/${label}`,
        },
      },
    );

    if (result.status !== 0) hasFailure = true;
  }
}

process.exitCode = hasFailure ? 1 : 0;
