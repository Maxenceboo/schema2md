import { Client } from 'pg';
import { Schema, Table, Column, ForeignKey } from '../core/models';
import { toGeneric } from '../core/typeMapping';

export class PostgresExtractor {
  constructor(private url: string, private schema: string = 'public') {}

  async load(includeTables?: string[]): Promise<Schema> {
    const client = new Client({ connectionString: this.url });
    await client.connect();
    try {
      const tablesRes = await client.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_type='BASE TABLE' AND table_schema=$1
         ORDER BY table_name`, [this.schema]);
      let tableNames = tablesRes.rows.map((r: any) => r.table_name as string);
      if (includeTables) tableNames = includeTables;

      // Columns
      const colsRes = await client.query(
        `SELECT table_name, column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema=$1 AND table_name = ANY($2::text[])`, [this.schema, tableNames]);

      // PKs
      const pksRes = await client.query(
        `SELECT kcu.table_name, kcu.column_name
           FROM information_schema.table_constraints tc
           JOIN information_schema.key_column_usage kcu
             ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = $1
            AND kcu.table_name = ANY($2::text[])`, [this.schema, tableNames]);
      const pkSet = new Set(pksRes.rows.map((r: any) => `${r.table_name}.${r.column_name}`));

      // FKs
      const fksRes = await client.query(
        `SELECT tc.constraint_name,
                kcu.table_name   AS from_table,
                kcu.column_name  AS from_column,
                ccu.table_name   AS to_table,
                ccu.column_name  AS to_column
           FROM information_schema.table_constraints tc
           JOIN information_schema.key_column_usage kcu
             ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
           JOIN information_schema.constraint_column_usage ccu
             ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = $1
            AND kcu.table_name = ANY($2::text[])`, [this.schema, tableNames]);

      // Comments (optional)
      const commentsRes = await client.query(
        `SELECT c.relname AS table_name, obj_description(c.oid) AS table_comment
           FROM pg_class c
           JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = $1 AND c.relkind='r'`, [this.schema]);
      const tableComment = new Map<string, string | null>(commentsRes.rows.map((r: any) => [r.table_name, r.table_comment]));

      const colCommentsRes = await client.query(
        `SELECT c.relname AS table_name, a.attname AS column_name, col_description(c.oid, a.attnum) AS column_comment
           FROM pg_class c
           JOIN pg_namespace n ON n.oid = c.relnamespace
           JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
          WHERE n.nspname = $1`, [this.schema]);
      const colComment = new Map<string, string | null>(colCommentsRes.rows.map((r: any) => [`${r.table_name}.${r.column_name}`, r.column_comment]));

      const columnsByTable = new Map<string, Column[]>();
      for (const row of colsRes.rows) {
        const key = `${row.table_name}`;
        const cols = columnsByTable.get(key) || [];
        const id = `${row.table_name}.${row.column_name}`;
        cols.push({
          name: row.column_name,
          type: toGeneric(row.data_type),
          nullable: String(row.is_nullable).toUpperCase() === 'YES',
          default: row.column_default ?? null,
          is_pk: pkSet.has(id),
          is_fk: false,
          comment: colComment.get(id) ?? null
        });
        columnsByTable.set(key, cols);
      }

      const fks: ForeignKey[] = fksRes.rows.map((r: any) => ({
        name: r.constraint_name,
        from_table: r.from_table,
        from_column: r.from_column,
        to_table: r.to_table,
        to_column: r.to_column
      }));

      // mark FK flags
      for (const fk of fks) {
        const cols = columnsByTable.get(fk.from_table) || [];
        const c = cols.find(x => x.name === fk.from_column);
        if (c) c.is_fk = true;
      }

      const tables: Table[] = [];
      for (const t of tableNames) {
        tables.push({
          name: t,
          comment: tableComment.get(t) ?? null,
          columns: columnsByTable.get(t) || [],
          fks: fks.filter(f => f.from_table === t)
        });
      }
      return { tables };
    } finally {
      await client.end();
    }
  }
}


