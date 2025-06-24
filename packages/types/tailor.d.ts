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
  /**
   * getSecrets returns multiple secret objects (key = name, value = secret)
   * at once according to vault and secret names.
   * 
   * If a secret does not exist, it will not be included in the result.
   */
  function getSecrets<const T extends readonly string[]>(
    vault: string,
    names: T
  ): Promise<Partial<Record<T[number], string>>>;

  /**
   * getSecret returns a secret according to vault and name.
   * 
   * If the secret does not exist, undefined is returned.
   */
  function getSecret(
    vault: string,
    name: string
  ): Promise<string | undefined>;
}