import { writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Schema } from '../core/models';
import { erDiagram } from '../emitters/mermaid';

function which(cmd: string): boolean {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'ignore' });
  return r.status === 0;
}

export type DiagramFormat = 'svg' | 'png' | 'pdf';

async function tryKroki(diagram: string, outPath: string, format: DiagramFormat): Promise<boolean> {
  const urlBase = process.env.KROKI_URL || 'https://kroki.io';
  const endpoint = `${urlBase}/mermaid/${format}`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: diagram
  });
  if (!resp.ok) return false;
  const buf = new Uint8Array(await resp.arrayBuffer());
  writeFileSync(outPath, buf);
  return existsSync(outPath);
}

export async function renderMermaidDiagram(schema: Schema, outPath: string, opts?: { dockerImage?: string, format?: DiagramFormat }): Promise<{ ok: boolean, outPath?: string, log?: string }> {
  const format: DiagramFormat = (opts?.format || 'png');
  const isImage = /\.(png|svg|pdf)$/i.test(outPath);
  const baseNoExt = outPath.replace(/\.[^.]+$/, '');
  const base = isImage ? baseNoExt : (baseNoExt + '-er');
  const imgPath = isImage ? outPath : `${base}.${format}`;
  const mmdPath = `${base}.mmd`;

  const mmd = erDiagram(schema);
  writeFileSync(mmdPath, mmd, 'utf-8');

  // 1) Try Docker Mermaid CLI if provided
  const image = opts?.dockerImage;
  if (image && which('docker')) {
    const wd = resolve(dirname(outPath));
    const input = basename(mmdPath);
    const output = basename(imgPath);
    const args = ['run','--rm','-v', `${wd}:/data`, '-w', '/data', image, 'mmdc','-i', input,'-o', output,'-b','transparent'];
    const r = spawnSync('docker', args, { encoding: 'utf-8' });
    if (r.status === 0 && existsSync(imgPath)) return { ok: true, outPath: imgPath };
  }

  // 2) Try Kroki HTTP fallback
  try {
    const ok = await tryKroki(mmd, imgPath, format);
    if (ok) return { ok: true, outPath: imgPath };
  } catch (e: any) {
    return { ok: false, log: e?.message || String(e) };
  }
  return { ok: false, log: 'Mermaid render failed (Docker+Kroki)' };
}
