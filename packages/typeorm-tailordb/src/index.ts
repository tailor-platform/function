export type QueryResult<T = unknown> = {
  rows: T[];
  rowCount: number;
  command: string;
};

/**
 * Minimal QueryRunner-like adapter backed by TailorDB client.
 * Provides basic query execution and transaction controls.
 */
export class TailordbClientQueryRunner {
  constructor(private readonly client: Tailordb.Client) {}

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async release(): Promise<void> {
    await this.client.end();
  }

  async query<T = unknown>(sql: string, parameters: unknown[] = []): Promise<QueryResult<T>> {
    const res = await this.client.queryObject<T>(sql, parameters);
    return {
      rows: res.rows ?? [],
      rowCount: res.rowCount ?? 0,
      command: res.command ?? "",
    };
  }

  async startTransaction(isolation?: string): Promise<void> {
    const sql = isolation ? `begin isolation level ${isolation}` : "begin";
    await this.query(sql);
  }

  async commitTransaction(): Promise<void> {
    await this.query("commit");
  }

  async rollbackTransaction(): Promise<void> {
    await this.query("rollback");
  }
}

export class TailordbDataSourceHelpers {
  constructor(private readonly client: Tailordb.Client) {}

  createQueryRunner(): TailordbClientQueryRunner {
    return new TailordbClientQueryRunner(this.client);
  }

  async withTransaction<T>(fn: (qr: TailordbClientQueryRunner) => Promise<T>, isolation?: string): Promise<T> {
    const qr = this.createQueryRunner();
    await qr.startTransaction(isolation);
    try {
      const out = await fn(qr);
      await qr.commitTransaction();
      return out;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    }
  }
}

/*
  Experimental TailorDB driver for TypeORM (browser build).
  - Targets typeorm/browser/* to avoid Node built-ins (e.g., crypto) in non-Node environments.
  - Provides minimal functionality for DataSource.initialize, basic queries, transactions, and basic Repository/QueryBuilder CRUD.
  - Schema sync and migrations are NOT supported (use codegen instead).
*/

import { DriverFactory } from 'typeorm/browser/driver/DriverFactory.js';
import { Broadcaster } from 'typeorm/browser/subscriber/Broadcaster.js';
import { DataSource } from 'typeorm';
import type { MixedList } from 'typeorm/common/MixedList';
import type { EntitySchema } from 'typeorm/entity-schema/EntitySchema';

type QueryRunner = any;
type IsolationLevel = string | undefined;

export class TailordbQueryRunnerPrototype {
  public connection: any;
  public isReleased = false;
  public isTransactionActive = false;
  public data: Record<string, unknown> = {};
  public manager: any;
  public broadcaster: any;

  constructor(private readonly client: Tailordb.Client, private readonly driver: TailordbDriverPrototype) {
    this.connection = (driver as any).connection;
    this.manager = this.connection?.manager;
    this.broadcaster = new Broadcaster(this as any);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async release(): Promise<void> {
    this.isReleased = true;
    // Do not end the shared client here. The driver manages lifecycle.
  }

  async startTransaction(isolation?: IsolationLevel): Promise<void> {
    const sql = isolation ? `begin isolation level ${isolation}` : 'begin';
    await this.query(sql);
    this.isTransactionActive = true;
  }

  async commitTransaction(): Promise<void> {
    await this.query('commit');
    this.isTransactionActive = false;
  }

  async rollbackTransaction(): Promise<void> {
    await this.query('rollback');
    this.isTransactionActive = false;
  }

  async query(query: string, parameters?: unknown[], useStructuredResult?: boolean): Promise<any> {
    query = query.replace(/COUNT\(1\)/, 'COUNT(*)'); // TailorDB does not support multiple statements per query
    console.log(`[tailordb] query: ${query} -- params: ${JSON.stringify(parameters)}`);
    const res = await this.client.queryObject<any>(query, parameters ?? []);
    const rows = (res as any)?.rows ?? [];
    const rowCount = (res as any)?.rowCount ?? rows.length ?? 0;
    if (useStructuredResult) {
      return { records: rows, affected: rowCount, raw: rows };
    }
    return rows;
  }
}

export class TailordbDriverPrototype {
  public options: any;
  private client: Tailordb.Client;
  public connection: any;
  // Feature flags to satisfy TypeORM internals
  public supportedUpsertTypes: string[] = [];
  public spatialTypes: string[] = [];
  public withLengthColumnTypes: string[] = [];
  public withPrecisionColumnTypes: string[] = [];
  public withScaleColumnTypes: string[] = [];
  public mappedDataTypes: any = {
    createDate: 'timestamp',
    createDateDefault: 'CURRENT_TIMESTAMP',
    createDatePrecision: undefined,
    updateDate: 'timestamp',
    updateDateDefault: 'CURRENT_TIMESTAMP',
    updateDatePrecision: undefined,
    deleteDate: 'timestamp',
    deleteDateNullable: true,
    deleteDatePrecision: undefined,
    version: 'int',
    treeLevel: 'int',
  };
  public dataTypeDefaults: Record<string, any> = {};
  public supportedDataTypes: string[] = [
    'int', 'integer', 'bigint', 'smallint', 'numeric', 'decimal', 'real', 'float',
    'varchar', 'character varying', 'char', 'character', 'text',
    'boolean', 'date', 'time', 'timestamp', 'timestamptz',
    'uuid', 'json', 'jsonb',
  ];

  constructor(options: any) {
    this.options = options;
    const ns = options?.tailordb?.namespace ?? options?.namespace;
    // Pretend to be postgres family to make TypeORM generate positional ($1...) parameters and proper SQL paths
    this.options.type = 'postgres';
    if (!this.options.schema) {
      this.options.schema = options?.schema ?? options?.tailordb?.schema ?? ns;
    }
    this.client = new tailordb.Client({ namespace: ns });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async afterConnect(): Promise<void> {
    // no-op
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  createQueryRunner(_mode: 'master' | 'slave' = 'master'): QueryRunner {
    return new TailordbQueryRunnerPrototype(this.client, this);
  }

  // Utilities expected by some TypeORM code paths
  escape(identifier: string): string {
    if (identifier.startsWith('"') && identifier.endsWith('"')) {
      return identifier;
    }
    return '"' + identifier.replace(/"/g, '""') + '"';
  }

  buildTableName(tableName: string, _schema?: string): string {
    return this.escape(tableName);
  }

  createParameter(_parameterName: string, index: number): string {
    // Postgres-style positional parameters are 1-based
    return `$${index + 1}`;
  }

  isReturningSqlSupported(): boolean { return true; }

  // Indicates if DB can generate UUIDs on its own; returning true prevents client-side generation paths from erroring
  isUUIDGenerationSupported(): boolean { return true; }

  escapeQueryWithParameters(sql: string, parameters: any, nativeParameters: any): [string, any[]] {
    if (Array.isArray(nativeParameters)) return [sql, nativeParameters];
    const dict = (nativeParameters && typeof nativeParameters === 'object' && Object.keys(nativeParameters).length > 0)
      ? nativeParameters
      : (parameters && typeof parameters === 'object' ? parameters : {});
    const paramOrder: string[] = [];
    sql = sql.replace(/:([A-Za-z0-9_]+)/g, (_m, name: string) => {
      if (!(name in (dict as any))) return _m;
      let idx = paramOrder.indexOf(name);
      if (idx === -1) { paramOrder.push(name); idx = paramOrder.length - 1; }
      return `$${idx + 1}`;
    });
    const values = paramOrder.map((k) => (dict as any)[k]);
    return [sql, values];
  }

  // Pass-through param value hook used by QueryBuilders in some paths
  parametrizeValue(_column: any, value: any): any { return value; }

  // Stubs required by metadata building and various code paths
  preparePersistentValue(value: any): any { return value; }
  prepareHydratedValue(value: any): any { return value; }
  normalizeType(_column: any): string { return 'text'; }
  normalizeDefault(_column: any): any { return undefined; }
  normalizeIsUnique(_column: any): boolean { return false; }
  // Map RETURNING rows to entity fields
  createGeneratedMap(metadata: any, insertResult: any): any {
    let row: any = undefined;
    if (insertResult && typeof insertResult === 'object') {
      if (Array.isArray((insertResult as any).records)) {
        row = (insertResult as any).records[0];
      } else if (Array.isArray((insertResult as any).raw)) {
        row = (insertResult as any).raw[0];
      } else if (Array.isArray(insertResult)) {
        row = (insertResult as any)[0];
      } else {
        row = insertResult;
      }
    }
    if (!row) return undefined;
    const map: any = {};
    for (const column of (metadata?.columns ?? [])) {
      const dbName = column.databaseName;
      if (Object.prototype.hasOwnProperty.call(row, dbName)) {
        map[column.propertyName] = (row as any)[dbName];
      }
    }
    return map;
  }
  obtainMasterConnection(): any { return null; }
  obtainSlaveConnection(): any { return null; }
  createSchemaBuilder(): never { throw new Error('SchemaBuilder not supported in Tailordb prototype'); }
  createQueryRunnerMode(_mode: any): QueryRunner { return this.createQueryRunner('master'); }
}

/**
 * Factory that patches DriverFactory (browser build) and returns a configured DataSource.
 */
export function createDatasource(namespace: string, entities?: MixedList<Function | string | EntitySchema>): DataSource {
  const Factory: any = DriverFactory as any;
  if (Factory.__tailordb_patched) {
    throw Error('Tailordb driver already registered');
  }
  const originalCreate = Factory.prototype.create;
  Factory.prototype.create = function (connection: any) {
    const options = connection?.options;
    if (options && options.type === 'tailordb') {
      const d = new (TailordbDriverPrototype as any)(options);
      (d as any).connection = connection;
      return d;
    }
    return originalCreate.apply(this, arguments as any);
  };
  Factory.__tailordb_patched = true;
  return new DataSource({
    type: 'tailordb' as any,
    tailordb: { namespace },
    entities: entities,
    synchronize: false,
    logging: true,
  } as any);
}
