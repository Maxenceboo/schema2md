const GENERIC: Record<string, string> = {
  'INT': 'Integer', 'INTEGER': 'Integer', 'TINYINT': 'Integer', 'SMALLINT': 'Integer',
  'BIGINT': 'Integer', 'UNSIGNED BIG INT': 'Integer',
  'REAL': 'Float', 'DOUBLE': 'Float', 'DOUBLE PRECISION': 'Float', 'FLOAT': 'Float',
  'NUMERIC': 'Numeric', 'DECIMAL': 'Numeric', 'BOOLEAN': 'Boolean',
  'DATE': 'Date', 'DATETIME': 'Datetime', 'TIMESTAMP': 'Datetime',
  'TEXT': 'String', 'CLOB': 'String', 'CHAR': 'String', 'VARCHAR': 'String', 'NVARCHAR': 'String',
  'BLOB': 'Blob'
};

export function toGeneric(dbType: string | null | undefined): string {
  if (!dbType) return 'Unknown';
  const t = String(dbType).trim().toUpperCase();
  const base = t.match(/^([A-Z ]+)/)?.[1].trim() ?? t;
  const norm = base.replace(/\s+/g, ' ');
  return GENERIC[norm] ?? (norm.includes('CHAR') || norm.includes('TEXT') ? 'String' : capitalize(norm));
}

function capitalize(s: string) {
  return s.toLowerCase().replace(/(^|\s)([a-z])/g, (_, a, b) => a + b.toUpperCase());
}

