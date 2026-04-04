import { readFileSync } from 'node:fs';
import initSqlJs, { Database, QueryExecResult } from 'sql.js';
import { Schema, Table, Column, ForeignKey } from '../core/models';
import { toGeneric } from '../core/typeMapping';

function rows(res: QueryExecResult | undefined): any[] {
  if (!res) return [];
  const { columns, values } = res;
  return values.map((v: any) => Object.fromEntries(v.map((val: any, i: number) => [columns[i], val])));
}

export class SQLiteExtractor {
  constructor(private path: string) {}

  async load(includeTables?: string[]): Promise<Schema> {
    const SQL = await initSqlJs();
    const data = readFileSync(this.path);
    const db = new SQL.Database(new Uint8Array(data));
    try {
      const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0];
      let tableNames: string[] = rows(result).map(r => String(r.name));
      if (includeTables) tableNames = includeTables;

      const tables: Table[] = [];
      for (const tname of tableNames) {
        const info = db.exec(`PRAGMA table_info('${tname.replace(/'/g, "''")}')`)[0];
        const cols: Column[] = rows(info).map(r => ({
          name: String(r.name),
          type: toGeneric(String(r.type ?? '')),
          nullable: Number(r.notnull) === 0,
          default: r.dflt_value == null ? null : String(r.dflt_value),
          is_pk: Number(r.pk) === 1,
          is_fk: false,
          comment: null
        }));

        const fkRes = db.exec(`PRAGMA foreign_key_list('${tname.replace(/'/g, "''")}')`)[0];
        const fks: ForeignKey[] = rows(fkRes).map(r => ({
          name: `fk_${tname}_${r.from}_to_${r.table}_${r.to}`,
          from_table: tname,
          from_column: String(r.from),
          to_table: String(r.table),
          to_column: String(r.to)
        }));
        for (const fk of fks) {
          const c = cols.find(x => x.name === fk.from_column);
          if (c) c.is_fk = true;
        }
        tables.push({ name: tname, columns: cols, fks });
      }
      return { tables };
    } finally {
      db.close();
    }
  }
}

