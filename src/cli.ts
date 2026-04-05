#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { loadConfig, mergePatterns } from './utils/config';
import { excludeNames } from './utils/filters';
import { SQLiteExtractor } from './extractors/sqliteExtractor';
import { PostgresExtractor } from './extractors/postgresExtractor';
import { MySQLExtractor } from './extractors/mysqlExtractor';
import { renderMarkdown } from './emitters/markdown';
import { renderLatex } from './emitters/latex';
import { renderMermaidDiagram } from './utils/mermaidExport';
import { compileLatex, cleanupLatex } from './utils/latexCompile';

function parseUrlToPath(urlStr: string): string {
  const u = new URL(urlStr);
  if (u.protocol !== 'sqlite:') throw new Error('Only sqlite URLs are supported (sqlite:///absolute/path.db)');
  let p = u.pathname;
  if (process.platform === 'win32' && p.startsWith('/') && p[2] === ':') p = p.slice(1);
  return p;
}

async function loadSchema(url: string, patterns: string[]): Promise<import('./core/models').Schema> {
  const proto = new URL(url).protocol;
  if (proto.startsWith('sqlite')) {
    const p = parseUrlToPath(url);
    if (!existsSync(p)) throw new Error(`SQLite file not found: ${p}`);
    const ex = new SQLiteExtractor(p);
    const all = await ex.load();
    const names = all.tables.map(t => t.name);
    const kept = excludeNames(names, patterns);
    return (kept.length === names.length) ? all : await ex.load(kept);
  }
  if (proto.startsWith('postgres')) {
    const schema = new URL(url).searchParams.get('schema') || 'public';
    const ex = new PostgresExtractor(url, schema);
    const all = await ex.load();
    const names = all.tables.map(t => t.name);
    const kept = excludeNames(names, patterns);
    return (kept.length === names.length) ? all : await ex.load(kept);
  }
  if (proto.startsWith('mysql')) {
    const ex = new MySQLExtractor(url);
    const all = await ex.load();
    const names = all.tables.map(t => t.name);
    const kept = excludeNames(names, patterns);
    return (kept.length === names.length) ? all : await ex.load(kept);
  }
  throw new Error('Unsupported URL scheme. Use sqlite://, postgres://, or mysql://');
}

async function main() {
  const { values } = parseArgs({
    options: {
      url: { type: 'string' },
      output: { type: 'string' },
      exclude: { type: 'string', default: '' },
      title: { type: 'string', default: 'Database Documentation' },
      format: { type: 'string', default: 'md' },
      summary: { type: 'boolean', default: false },
      compile: { type: 'boolean', default: false },
      cleanup: { type: 'string', default: 'aux' },
      docker: { type: 'boolean', default: false },
      'docker-image': { type: 'string', default: 'paperist/alpine-texlive' },
      er: { type: 'boolean', default: true },
      'er-docker-image': { type: 'string', default: 'minlag/mermaid-cli:latest' },
      'diagram-format': { type: 'string', default: 'png' },
      'diagram-only': { type: 'boolean', default: false }
    },
    allowPositionals: false
  } as any);

  if (!values.url || !values.output) throw new Error('--url and --output are required');

  const conf = loadConfig();
  const excludeCli = String(values.exclude || '').split(',').map((s: string)=>s.trim()).filter(Boolean);
  const patterns = mergePatterns(excludeCli, conf.exclude);

  const schema = await loadSchema(String(values.url), patterns);
  const outPath = String(values.output);
  const dir = dirname(outPath);
  if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });

  const fmt = String(values.format || 'md').toLowerCase();
  if (Boolean(values['diagram-only'])) {
    const desiredOut = String(values.output);
    const fmtFromExt = /\.(png|svg|pdf)$/i.test(desiredOut) ? desiredOut.replace(/^.*\./,'').toLowerCase() : String(values['diagram-format'] || 'png');
    const diag = await renderMermaidDiagram(schema, desiredOut, { dockerImage: String(values['er-docker-image'] || ''), format: fmtFromExt as any });
    if (!diag.ok || !diag.outPath) { console.error(diag.log || 'Diagram generation failed'); process.exit(1); }
    console.log(`Wrote diagram: ${diag.outPath}`);
    return;
  }
  const isSummary = Boolean(values.summary);
  let figure: string | undefined;
  if (fmt === 'latex' && values.er !== false) {
    const diag = await renderMermaidDiagram(schema, outPath, { dockerImage: String(values['er-docker-image'] || ''), format: String(values['diagram-format'] || 'png') as any });
    if (diag.ok && diag.outPath) figure = require('node:path').basename(diag.outPath);
  }

  const content = fmt === 'latex' ? renderLatex(schema, String(values.title), isSummary, figure) : renderMarkdown(schema, String(values.title));
  writeFileSync(outPath, content, 'utf-8');

  if (fmt === 'latex' && values.compile) {
    const res = compileLatex(outPath, { docker: Boolean(values.docker), dockerImage: String(values['docker-image'] || 'paperist/alpine-texlive') });
    if (!res.ok) {
      console.error(res.log || 'LaTeX compile failed');
      process.exit(1);
    }
    const mode = String(values.cleanup || 'aux') as any;
    cleanupLatex(outPath, mode);
  }
  console.log(`Wrote: ${outPath}`);
}

main().catch(err => { console.error((err as Error).message); process.exit(1); });



