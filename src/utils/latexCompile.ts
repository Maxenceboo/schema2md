import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';

export type CleanupMode = 'none' | 'aux' | 'all';

function which(cmd: string): boolean {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'ignore' });
  return r.status === 0;
}

export function compileLatex(texPath: string): { ok: boolean; pdfPath?: string; log?: string } {
  const texAbs = resolve(texPath);
  const dir = dirname(texAbs);
  const engine = which('pdflatex') ? 'pdflatex' : (which('xelatex') ? 'xelatex' : null);
  if (!engine) return { ok: false, log: 'No LaTeX engine found (pdflatex/xelatex). Install TeX Live or MiKTeX.' };
  const args = ['-interaction=nonstopmode', '-halt-on-error', texAbs];
  const r = spawnSync(engine, args, { cwd: dir, encoding: 'utf-8' });
  const pdfPath = texAbs.replace(/\.tex$/i, '.pdf');
  const ok = r.status === 0 && existsSync(pdfPath);
  return { ok, pdfPath, log: r.stdout + (r.stderr || '') };
}

export function cleanupLatex(texPath: string, mode: CleanupMode) {
  const fs = require('node:fs');
  const path = require('node:path');
  const abs = path.resolve(texPath);
  const base = abs.replace(/\.tex$/i, '');
  const exts = ['.aux', '.log', '.out', '.toc', '.synctex.gz'];
  if (mode === 'aux' || mode === 'all') {
    for (const ext of exts) {
      const p = base + ext;
      try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch {}
    }
  }
  if (mode === 'all') {
    try { if (fs.existsSync(abs)) fs.unlinkSync(abs); } catch {}
  }
}
