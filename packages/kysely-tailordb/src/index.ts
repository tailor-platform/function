import {
  CompiledQuery,
  type DatabaseConnection,
  type DatabaseIntrospector,
  type Dialect,
  type DialectAdapter,
  type Driver,
  type Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  type QueryCompiler,
  type QueryResult,
  type TransactionSettings,
} from "kysely";

export class TailordbDialect implements Dialect {
  constructor(private client: Tailordb.Client) {}

  createDriver(): Driver {
    return new TailordbDriver(this.client);
  }

  createQueryCompiler(): QueryCompiler {
    return new PostgresQueryCompiler();
  }

  createAdapter(): DialectAdapter {
    return new PostgresAdapter();
  }

  // biome-ignore lint/suspicious/noExplicitAny:
  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new PostgresIntrospector(db);
  }
}

class TailordbDriver implements Driver {
  constructor(private client: Tailordb.Client) {}

  async init(): Promise<void> {
    await this.client.connect();
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    return new TailordbConnection(this.client);
  }

  async beginTransaction(
    connection: DatabaseConnection,
    settings: TransactionSettings,
  ): Promise<void> {
    const query = settings.isolationLevel
      ? `begin isolation level ${settings.isolationLevel}`
      : "begin";
    await connection.executeQuery(CompiledQuery.raw(query));
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("commit"));
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("rollback"));
  }

  async releaseConnection(_connection: DatabaseConnection): Promise<void> {}

  async destroy(): Promise<void> {
    await this.client.end();
  }
}

class TailordbConnection implements DatabaseConnection {
  constructor(private client: Tailordb.Client) {}

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    const result = await this.client.queryObject<O>(compiledQuery.sql, [
      ...compiledQuery.parameters,
    ]);
    const rows = result.rows ?? [];

    if (["INSERT", "UPDATE", "DELETE"].includes(result.command)) {
      const numAffectedRows = BigInt(result.rowCount);
      return {
        numAffectedRows,
        numUpdatedOrDeletedRows: numAffectedRows,
        rows,
      };
    }

    return {
      rows: result.rows ?? [],
    };
  }

  // biome-ignore lint/correctness/useYield:
  async *streamQuery(_compiledQuery: CompiledQuery, _chunkSize: number) {
    throw new Error("Not supported");
  }
}
