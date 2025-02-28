declare namespace Tailordb {
  class Client {
    constructor(config?: { namespace?: string });
    connect(): Promise<void>;
    end(): Promise<void>;
    queryObject<O>(
      sql: string,
      args?: readonly unknown[]
    ): Promise<QueryResult<O>>;
  }

  interface QueryResult<T> {
    rows: T[];
    command: CommandType;
    rowCount: number;
  }

  type CommandType =
    | "INSERT"
    | "DELETE"
    | "UPDATE"
    | "SELECT"
    | "MOVE"
    | "FETCH"
    | "COPY"
    | "CREATE";
}

declare const tailordb: {
  Client: typeof Tailordb.Client;
};

declare namespace tailor.secretmanager {
  // getSecrets returns multiple secret objects(key=name, value=secret) at once according to vault, names
  function getSecrets(vault: string, names: string[]): Promise<Record<string, string>>
  // getSecret returns a secret according to vault, name
  function getSecret(vault: string, name: string): Promise<string>
}
