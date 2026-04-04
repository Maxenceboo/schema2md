import { Schema } from '../core/models';

export function erDiagram(schema: Schema): string {
  const lines: string[] = [];
  lines.push('erDiagram');
  for (const table of schema.tables) {
    lines.push(`    ${table.name} {`);
    for (const col of table.columns) {
      const pk = col.is_pk ? ' PK' : '';
      const coltype = col.type.toLowerCase();
      lines.push(`        ${coltype} ${col.name}${pk}`);
    }
    lines.push('    }');
  }
  for (const table of schema.tables) {
    for (const fk of table.fks) {
      lines.push(`    ${fk.to_table} ||--o{ ${fk.from_table} : \"${fk.name}\"`);
    }
  }
  return lines.join('\n');
}
