import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const cwd = process.cwd();
function toInt(x, def) {
  const n = parseInt(String(x || ''), 10);
  return Number.isFinite(n) ? n : def;
}

let port = toInt(process.env.DEV_PORT, undefined);

// Prefer explicit override
if (!port) {
  // If running inside Trae workspace (path hint), default to 3002 to avoid SW cache in preview
  if (cwd.includes('Projetos Trae')) {
    port = 3002;
  } else {
    port = 3000;
  }
}

// Optional file-based override: .env.local DEV_PORT or .trae/dev_port.json
try {
  const envLocal = path.join(cwd, '.env.local');
  if (fs.existsSync(envLocal)) {
    const txt = fs.readFileSync(envLocal, 'utf8');
    const m = txt.match(/^\s*DEV_PORT\s*=\s*(\d+)\s*$/m);
    if (m) port = toInt(m[1], port);
  }
} catch {}
try {
  const fp = path.join(cwd, '.trae', 'dev_port.json');
  if (fs.existsSync(fp)) {
    const cfg = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (cfg && cfg.port) port = toInt(cfg.port, port);
  }
} catch {}

const nextBin = path.join('node_modules', 'next', 'dist', 'bin', 'next');
const args = [nextBin, 'dev', '--turbopack', '-p', String(port)];

const child = spawn(process.execPath, args, {
  stdio: 'inherit',
  shell: false,
  env: { ...process.env },
});

child.on('exit', (code) => process.exit(code ?? 0));
