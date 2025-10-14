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

export * from "./experimental";
