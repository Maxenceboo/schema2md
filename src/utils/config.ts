import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export type Config = { exclude: string[] };

const DEFAULT: Config = { exclude: [] };
const FILENAME = '.dbdoc.json';

export function loadConfig(cwd = process.cwd()): Config {
  const path = join(cwd, FILENAME);
  if (!existsSync(path)) return { ...DEFAULT };
  try {
    const raw = readFileSync(path, 'utf-8');
    const obj = JSON.parse(raw);
    const out: Config = { ...DEFAULT };
    if (obj && Array.isArray(obj.exclude)) out.exclude = obj.exclude.map(String);
    return out;
  } catch {
    return { ...DEFAULT };
  }
}

export function mergePatterns(cli: string[] | undefined, conf: string[]): string[] {
  const list = [...(conf || []), ...(cli || [])];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of list) if (!seen.has(p)) { seen.add(p); out.push(p); }
  return out;
}
