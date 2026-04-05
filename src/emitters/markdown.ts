import { Schema, Column, Table } from '../core/models';
import { erDiagram } from './mermaid';

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function sortColumns(cols: Column[]): Column[] {
  return [...cols].sort((a, b) => (Number(b.is_pk) - Number(a.is_pk)) || a.name.localeCompare(b.name));
}

function header(): string {
  return '| Column | Type | Attr | Null | Default | Description |\n|---|---|---|---|---|---|';
}

function row(c: Column): string {
  const attrs = [c.is_pk ? 'PK' : '', c.is_fk ? 'FK' : ''].filter(Boolean).join('/') || '-';
  const nullable = c.nullable ? 'Yes' : 'No';
  const defv = c.default != null && String(c.default).trim() !== '' ? `\`${String(c.default)}\`` : '-';
  const desc = c.comment?.trim() ? c.comment : '-';
  return `| ${c.name} | \`${c.type}\` | ${attrs} | ${nullable} | ${defv} | ${desc} |`;
}

function sectionForTable(t: Table): string[] {
  const lines: string[] = [];
  const id = slug(t.name);
  const pkCount = t.columns.filter(c => c.is_pk).length;
  const fkCount = t.fks.length;
  lines.push(`### ${t.name}`);
  lines.push(`<a id="table-${id}"></a>`);
  if (t.comment && t.comment.trim()) {
    lines.push('');
    lines.push(`_${t.comment.trim()}_`);
  }
  lines.push('');
  lines.push(`Columns: ${t.columns.length} / PK: ${pkCount} / FKs: ${fkCount}`);
  lines.push('');
  lines.push(header());
  for (const c of sortColumns(t.columns)) lines.push(row(c));
  if (t.fks.length) {
    lines.push('');
    lines.push('Foreign Keys');
    lines.push('');
    for (const fk of t.fks) {
      lines.push(`- \`${fk.from_table}.${fk.from_column}\` -> \`${fk.to_table}.${fk.to_column}\` (\`${fk.name}\`)`);
    }
  }
  lines.push('');
  lines.push('[Back to index](#table-index)');
  lines.push('');
  return lines;
}

export function renderMarkdown(schema: Schema, title = 'Database Documentation'): string {
  const out: string[] = [];
  const tables = [...schema.tables].sort((a, b) => a.name.localeCompare(b.name));
  out.push(`# ${title}`);
  out.push('');
  out.push('## Table Index');
  out.push('<a id="table-index"></a>');
  for (const t of tables) out.push(`- [${t.name}](#table-${slug(t.name)})`);
  out.push('');
  out.push('## Global ER Diagram');
  out.push('```mermaid');
  out.push(erDiagram(schema));
  out.push('```');
  out.push('');
  out.push('## Tables');
  out.push('');
  for (const t of tables) out.push(...sectionForTable(t));
  return out.join('\n');
}

