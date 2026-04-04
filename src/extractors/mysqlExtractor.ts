import mysql from 'mysql2/promise';
import { Schema, Table, Column, ForeignKey } from '../core/models';
import { toGeneric } from '../core/typeMapping';

export class MySQLExtractor {
  constructor(private url: string, private database?: string) {}

  async load(includeTables?: string[]): Promise<Schema> {
    const conn = await mysql.createConnection(this.url);
    try {
      const [dbRow] = await conn.query("SELECT DATABASE() AS db");
      // @ts-ignore
      const dbName: string = (Array.isArray(dbRow) ? dbRow[0].db : (dbRow as any).db) as string;

      const [tablesRows] = await conn.query(
        "SELECT table_name, table_comment FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema=? ORDER BY table_name",
        [dbName]
      );
      let tableNames: string[] = (tablesRows as any[]).map(r => r.table_name as string);
      const tableComment = new Map<string, string | null>((tablesRows as any[]).map(r => [r.table_name as string, r.table_comment as string ?? null]));
      if (includeTables) tableNames = includeTables;

      const [colsRows] = await conn.query(
        "SELECT table_name, column_name, data_type, is_nullable, column_default, column_comment FROM information_schema.columns WHERE table_schema=? AND table_name IN (?)",
        [dbName, tableNames]
      );

      const [pkRows] = await conn.query(
        "SELECT kcu.table_name, kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name AND tc.table_schema=kcu.table_schema WHERE tc.constraint_type='PRIMARY KEY' AND tc.table_schema=? AND kcu.table_name IN (?)",
        [dbName, tableNames]
      );
      const pkSet = new Set((pkRows as any[]).map(r => `${r.table_name}.${r.column_name}`));

      const [fkRows] = await conn.query(
        "SELECT kcu.constraint_name, kcu.table_name AS from_table, kcu.column_name AS from_column, kcu.referenced_table_name AS to_table, kcu.referenced_column_name AS to_column FROM information_schema.key_column_usage kcu WHERE kcu.table_schema=? AND kcu.referenced_table_schema=? AND kcu.table_name IN (?) AND kcu.referenced_table_name IS NOT NULL",
        [dbName, dbName, tableNames]
      );

      const colComment = new Map<string, string | null>();
      const columnsByTable = new Map<string, Column[]>();
      for (const r of colsRows as any[]) {
        const key = r.table_name as string;
        const id = `${r.table_name}.${r.column_name}`;
        const cols = columnsByTable.get(key) || [];
        cols.push({
          name: r.column_name,
          type: toGeneric(r.data_type),
          nullable: String(r.is_nullable).toUpperCase() === 'YES',
          default: r.column_default ?? null,
          is_pk: pkSet.has(id),
          is_fk: false,
          comment: (r.column_comment ?? null) as string | null
        });
        columnsByTable.set(key, cols);
      }

      const fks: ForeignKey[] = (fkRows as any[]).map(r => ({
        name: r.constraint_name,
        from_table: r.from_table,
        from_column: r.from_column,
        to_table: r.to_table,
        to_column: r.to_column
      }));

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
      await conn.end();
    }
  }
}
