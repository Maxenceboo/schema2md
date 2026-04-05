import { Schema } from '../core/models';

function esc(s: string): string {
  return s
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([#%&_{}$])/g, '\\$1')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}');
}

function header(title: string): string[] {
  return [
    '\\documentclass[11pt]{article}',
    '\\usepackage[margin=2.5cm]{geometry}',
    '\\usepackage[T1]{fontenc}',
    '\\usepackage[utf8]{inputenc}',
    '\\usepackage{hyperref}',
    '\\usepackage{longtable}',
    '\\usepackage{booktabs}',
    '\\title{' + esc(title) + '}',
    '\\begin{document}',
    '\\maketitle',
  ];
}

function tableIndex(schema: Schema): string[] {
  const lines: string[] = [];
  lines.push('\\section*{Table Index}');
  lines.push('\\begin{itemize}');
  for (const t of schema.tables.sort((a,b)=>a.name.localeCompare(b.name))) {
    lines.push('  \\item ' + esc(t.name));
  }
  lines.push('\\end{itemize}');
  return lines;
}

function relationships(schema: Schema): string[] {
  const lines: string[] = [];
  lines.push('\\section*{Relations (FK)}');
  if (!schema.tables.some(t=>t.fks.length)) {
    lines.push('Aucune clé étrangère détectée.');
    return lines;
  }
  lines.push('\\begin{itemize}');
  for (const t of schema.tables) {
    for (const fk of t.fks) {
      lines.push('  \\item ' + esc(`${fk.from_table}.${fk.from_column} -> ${fk.to_table}.${fk.to_column}`));
    }
  }
  lines.push('\\end{itemize}');
  return lines;
}

function tableSummary(schema: Schema): string[] {
  const lines: string[] = [];
  lines.push('\\section*{Résumé}');
  const tableCount = schema.tables.length;
  const colCount = schema.tables.reduce((n,t)=>n + t.columns.length, 0);
  const fkCount = schema.tables.reduce((n,t)=>n + t.fks.length, 0);
  lines.push(`Total tables: ${tableCount}\\\\`);
  lines.push(`Total colonnes: ${colCount}\\\\`);
  lines.push(`Total clés étrangères: ${fkCount}`);
  return lines;
}

function tableDetails(schema: Schema): string[] {
  const lines: string[] = [];
  for (const t of schema.tables.sort((a,b)=>a.name.localeCompare(b.name))) {
    lines.push('\\section*{Table: ' + esc(t.name) + '}');
    if (t.comment) lines.push(esc(t.comment));
    lines.push('\\begin{longtable}{@{}llllll@{}}');
    lines.push('\\toprule');
    lines.push('Column & Type & Attr & Null & Default & Description \\\\');
    lines.push('\\midrule');
    const cols = [...t.columns].sort((a,b)=> (Number(b.is_pk)-Number(a.is_pk)) || a.name.localeCompare(b.name));
    for (const c of cols) {
      const attrs = [c.is_pk? 'PK' : '', c.is_fk? 'FK' : ''].filter(Boolean).join('/');
      const nullable = c.nullable ? 'Yes' : 'No';
      const defv = c.default != null && String(c.default).trim() !== '' ? esc(String(c.default)) : '-';
      const desc = c.comment?.trim() ? esc(c.comment) : '-';
      lines.push(`${esc(c.name)} & ${esc(c.type)} & ${esc(attrs || '-')} & ${nullable} & ${defv} & ${desc} \\\\`);
    }
    lines.push('\\bottomrule');
    lines.push('\\end{longtable}');
  }
  return lines;
}

export function renderLatex(schema: Schema, title = 'Database Documentation', summaryOnly = false): string {
  const out: string[] = [];
  out.push(...header(title));
  out.push(...tableSummary(schema));
  out.push('');
  out.push(...tableIndex(schema));
  out.push('');
  out.push(...relationships(schema));
  if (!summaryOnly) {
    out.push('');
    out.push(...tableDetails(schema));
  }
  out.push('\\end{document}');
  return out.join('\n');
}
