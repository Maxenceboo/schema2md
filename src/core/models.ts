export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  default?: string | null;
  is_pk: boolean;
  is_fk: boolean;
  comment?: string | null;
}

export interface ForeignKey {
  name: string;
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
}

export interface Table {
  name: string;
  comment?: string | null;
  columns: Column[];
  fks: ForeignKey[];
}

export interface Schema {
  tables: Table[];
}
