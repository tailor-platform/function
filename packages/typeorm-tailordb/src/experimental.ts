/*
  Experimental integration with TypeORM DataSource.

  Notes:
  - TypeORM does not provide a stable public API for custom drivers.
  - This prototype monkey-patches DriverFactory to register a 'tailordb' driver.
  - It implements a minimal subset to enable DataSource.initialize() and ds.query().
  - Repositories/QueryBuilder are not guaranteed to work in full. Use at your own risk.
*/

// Use loose typing to avoid tight coupling to internal TypeORM types.
type DataSourceOptions = any;
type QueryRunner = any;
type IsolationLevel = string | undefined;

export interface TailordbDataSourceOptions {
  type: 'tailordb';
  // TailorDB config
  tailordb: {
    namespace: string;
  };
  // Optional: schema name for generated SQL defaulting purposes
  schema?: string;
  // Everything else is passed through to TypeORM but largely unused here
  [k: string]: any;
}

export class TailordbQueryRunnerPrototype {
  // Minimal shape to satisfy TypeORM’s usage in ds.query and basic transaction APIs.
  // Not a full implementation of TypeORM QueryRunner.
  public connection: any;
  public isReleased = false;
  public isTransactionActive = false;
  public data = {} as Record<string, unknown>;

  constructor(private readonly client: Tailordb.Client) {}

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async release(): Promise<void> {
    this.isReleased = true;
    await this.client.end();
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

  async query(query: string, parameters?: unknown[]): Promise<any> {
    const res = await this.client.queryObject<any>(query, parameters ?? []);
    // Return pg-like result that TypeORM expects on Postgres
    return res;
  }

  // Stubs required by TypeORM patterns; not fully implemented.
  async manager() {
    throw new Error('Not implemented in prototype');
  }
  async clearDatabase() {
    throw new Error('Not implemented in prototype');
  }
}

export class TailordbDriverPrototype {
  // Minimal driver surface expected by DataSource during initialize and basic query execution.
  public options: TailordbDataSourceOptions;
  private client: Tailordb.Client;

  constructor(options: TailordbDataSourceOptions) {
    this.options = options;
    this.client = new tailordb.Client({ namespace: options.tailordb.namespace });
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

  async createQueryRunner(_mode: 'master' | 'slave' = 'master'): Promise<QueryRunner> {
    return new TailordbQueryRunnerPrototype(this.client);
  }

  // Escaping helpers expected in some code paths; provide simple Postgres-like behavior.
  escape(identifier: string): string {
    return '"' + identifier.replace(/"/g, '""') + '"';
  }

  buildTableName(tableName: string, schema?: string): string {
    return schema ? `${this.escape(schema)}.${this.escape(tableName)}` : this.escape(tableName);
  }

  // TypeORM uses this to create positional placeholders in QueryBuilder.
  createParameter(_parameterName: string, index: number): string {
    return `$${index}`;
  }

  isReturningSqlSupported(): boolean { return true; }

  // TypeORM may call this to replace parameters; keep minimal passthrough where parameters are already positional ($1...)
  escapeQueryWithParameters(sql: string, _parameters: any, nativeParameters: any): [string, any[]] {
    // If sql already contains $1 style placeholders, assume nativeParameters is the values array.
    if (Array.isArray(nativeParameters)) return [sql, nativeParameters];
    // Otherwise, best-effort map object parameters in insertion order.
    if (nativeParameters && typeof nativeParameters === 'object') {
      const keys = Object.keys(nativeParameters);
      const values = keys.map((k, i) => {
        const token = `$${i + 1}`;
        sql = sql.replace(new RegExp(':' + k + '\\b', 'g'), token);
        return nativeParameters[k];
      });
      return [sql, values];
    }
    return [sql, []];
  }

  // Stubs for unimplemented/unsupported features in the prototype driver.
  preparePersistentValue(value: any): any { return value; }
  prepareHydratedValue(value: any): any { return value; }
  normalizeType(_column: any): string { return 'text'; }
  normalizeDefault(_column: any): string | undefined { return undefined; }
  normalizeIsUnique(_column: any): boolean { return false; }
  obtainMasterConnection(): any { return null; }
  obtainSlaveConnection(): any { return null; }
  createSchemaBuilder(): any { throw new Error('SchemaBuilder not supported in prototype'); }
  createQueryRunnerMode(_mode: any): any { return this.createQueryRunner('master'); }
}

/**
 * Registers the experimental 'tailordb' driver by monkey-patching TypeORM's DriverFactory.
 * Must be called before creating a new DataSource.
 */
export async function registerTailordbDriver(): Promise<void> {
  // Dynamically import TypeORM internal factory; path may vary between dist shapes, try common ones.
  let factoryModule: any;
  try {
    factoryModule = await import('typeorm/driver/DriverFactory.js');
  } catch {
    factoryModule = await import('typeorm/driver/DriverFactory');
}

/**
 * Factory: returns a DataSource configured for TailorDB.
 * Internally registers the experimental driver to avoid leaking private API usage to callers.
 */
export async function createTailordbDataSource(options: Omit<TailordbDataSourceOptions, 'type'> & { [k: string]: any }) {
  await registerTailordbDriver();
  const { DataSource } = await import('typeorm');
  const ds = new DataSource({
    type: 'tailordb' as any,
    synchronize: false,
    logging: false,
    ...options,
  } as any);
  return ds;
}

/**
 * Convenience: create and initialize the DataSource.
 */
export async function initTailordbDataSource(options: Omit<TailordbDataSourceOptions, 'type'> & { [k: string]: any }) {
  const ds = await createTailordbDataSource(options);
  await ds.initialize();
  return ds;
}

  const DriverFactory = factoryModule.DriverFactory || factoryModule.default;
  if (!DriverFactory) throw new Error('Failed to locate TypeORM DriverFactory');

  const originalCreate = DriverFactory.prototype.create;
  if ((DriverFactory as any).__tailordb_patched) return;

  DriverFactory.prototype.create = function (options: DataSourceOptions) {
    if (options && options.type === 'tailordb') {
      return new TailordbDriverPrototype(options);
    }
    return originalCreate.apply(this, arguments as any);
  };
  (DriverFactory as any).__tailordb_patched = true;
}
