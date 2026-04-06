import fs from 'node:fs';

function parseDotEnvFile(contents) {
  const out = {};
  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

export function loadEnvFile(dotenvPath) {
  try {
    if (!fs.existsSync(dotenvPath)) return;
    const parsed = parseDotEnvFile(fs.readFileSync(dotenvPath, 'utf8'));
    for (const [k, v] of Object.entries(parsed)) {
      if (process.env[k] == null) process.env[k] = v;
    }
  } catch {
    // ignore
  }
}

