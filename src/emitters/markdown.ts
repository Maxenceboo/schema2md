import { Schema, Column } from '../core/models';
import { erDiagram } from './mermaid';

function mdHeader(): string {
  return '| Column | Type | PK/FK | Nullable | Default | Description |\n|---|---|---|---|---|---|';
}

function mdRow(c: Column): string {
  const flags = [c.is_pk ? 'PK' : '', c.is_fk ? 'FK' : ''].filter(Boolean).join('/');
  const pkfk = flags || '-';
  const nullable = c.nullable ? 'Yes' : 'No';
  const defv = c.default != null ? String(c.default) : '-';
  const desc = c.comment ?? '-';
  return `| ${c.name} | ${c.type} | ${pkfk} | ${nullable} | ${defv} | ${desc} |`;
}

export function renderMarkdown(schema: Schema, title = 'Database Documentation'): string {
  const out: string[] = [];
  out.push(`# ${title}`);
  out.push('');
  out.push('## Table Index');
  for (const t of schema.tables) out.push(`- [${t.name}](#table-${t.name.toLowerCase()})`);
  out.push('');
  out.push('## Global ER Diagram');
  out.push('```mermaid');
  out.push(erDiagram(schema));
  out.push('```');
  out.push('');
  for (const t of schema.tables) {
    out.push(`## Table: ${t.name}`);
    out.push(`<a id=\"table-${t.name.toLowerCase()}\"></a>`);
    out.push('');
    out.push(mdHeader());
    for (const c of t.columns) out.push(mdRow(c));
    if (t.fks.length) {
      out.push('');
      out.push('**Foreign Keys**');
      for (const fk of t.fks) out.push(`- ${fk.from_table}.${fk.from_column} -> ${fk.to_table}.${fk.to_column} (\`${fk.name}\`)`);
    }
    out.push('');
  }
  return out.join('\n');
}
