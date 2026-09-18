const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const candidates = [
  path.join(root, 'backend', 'venv', 'Scripts', 'ruff.exe'),
  path.join(root, 'backend', '.venv', 'Scripts', 'ruff.exe'),
  path.join(root, 'backend', 'venv', 'bin', 'ruff'),
  path.join(root, 'backend', '.venv', 'bin', 'ruff'),
  'ruff',
];

let ruffCmd = 'ruff';
for (const cand of candidates) {
  if (cand !== 'ruff' && fs.existsSync(cand)) {
    ruffCmd = cand;
    break;
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  process.exit(0);
}

try {
  execSync(`"${ruffCmd}" check --fix ${args.map(a => `"${a}"`).join(' ')}`, { stdio: 'inherit' });
} catch (e) {
  process.exit(e.status || 1);
}
