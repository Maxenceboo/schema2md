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
import { compileLatex, cleanupLatex } from './utils/latexCompile';

function parseUrlToPath(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== 'sqlite:') throw new Error('Only sqlite URLs are supported (sqlite:///absolute/path.db)');
    let p = u.pathname;
    if (process.platform === 'win32' && p.startsWith('/') && p[2] === ':') p = p.slice(1);
    return p;
  } catch (e) {
    throw new Error(`Invalid --url: ${(e as Error).message}`);
  }
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
      'docker-image': { type: 'string', default: 'paperist/alpine-texlive' }
    },
      output: { type: 'string' },
      exclude: { type: 'string', default: '' },
      title: { type: 'string', default: 'Database Documentation' },
      format: { type: 'string', default: 'md' },
      summary: { type: 'boolean', default: false },
      compile: { type: 'boolean', default: false },
      cleanup: { type: 'string', default: 'aux' },
      docker: { type: 'boolean', default: false },
      'docker-image': { type: 'string', default: 'paperist/alpine-texlive' },
    allowPositionals: false
  } as any);

  if (!values.url || !values.output) throw new Error('--url and --output are required');

  const conf = loadConfig();
  const excludeCli = String(values.exclude || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  const patterns = mergePatterns(excludeCli, conf.exclude);

    let schemaAll;
  if (String(new URL(String(values.url)).protocol).startsWith('sqlite')) {
    const sqlitePath = parseUrlToPath(String(values.url));
    if (!existsSync(sqlitePath)) throw new Error(`SQLite file not found: ${sqlitePath}`);
    const extractor = new SQLiteExtractor(sqlitePath);
    schemaAll = await extractor.load();
    const names = schemaAll.tables.map(t => t.name);
    const kept = excludeNames(names, patterns);
    var schema = (kept.length === names.length) ? schemaAll : await extractor.load(kept);
  } else if (String(new URL(String(values.url)).protocol).startsWith('postgres')) {
    const u = String(values.url);
    const schemaParam = new URL(u).searchParams.get('schema') || 'public';
    const extractor = new PostgresExtractor(u, schemaParam);
    schemaAll = await extractor.load();
    const names = schemaAll.tables.map(t => t.name);
    const kept = excludeNames(names, patterns);
    schema = (kept.length === names.length) ? schemaAll : await extractor.load(kept);
  } else if (String(new URL(String(values.url)).protocol).startsWith('mysql')) {
    const u = String(values.url);
    const extractor = new MySQLExtractor(u);
    schemaAll = await extractor.load();
    const names = schemaAll.tables.map(t => t.name);
    const kept = excludeNames(names, patterns);
    schema = (kept.length === names.length) ? schemaAll : await extractor.load(kept);
  } else {
    throw new Error('Unsupported URL scheme. Use sqlite://, postgres://, or mysql://');
  }

  const format = String(values.format || 'md').toLowerCase();
  const isSummary = Boolean(values.summary);
  const content = format === 'latex' ? renderLatex(schema, String(values.title), isSummary) : renderMarkdown(schema, String(values.title));
  const outPath = String(values.output);
  const dir = dirname(outPath);
  if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(outPath, content, 'utf-8');
  if (format === 'latex' && values.compile) {
    const res = compileLatex(outPath, { docker: Boolean(values.docker), dockerImage: String(values['docker-image'] || 'paperist/alpine-texlive') });
    if (!res.ok) { console.error(res.log || 'LaTeX compile failed'); process.exit(1); }
    const mode = String(values.cleanup || 'aux') as any;
    cleanupLatex(outPath, mode);
  }
  console.log(`Wrote: ${outPath}`);
}

main().catch(err => { console.error((err as Error).message); process.exit(1); });
















