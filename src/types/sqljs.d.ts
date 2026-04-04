declare module 'sql.js' {
  export interface QueryExecResult { columns: string[]; values: any[][] }
  export type Database = any;
  const init: (config?: any) => Promise<{ Database: new (data?: Uint8Array) => Database }>;
  export default init;
}
