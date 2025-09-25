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

/**
 * File stream iterator for TailorDB file downloads
 */
interface TailordbFileStreamIterator {
  /**
   * Get next chunk from the stream
   */
  next(): Promise<{ done: boolean; value?: any }>;

  /**
   * Close the stream session
   */
  close(): Promise<void>;

  /**
   * AsyncIterator symbol for for-await-of loops
   */
  [Symbol.asyncIterator](): TailordbFileStreamIterator;
}

declare const tailordb: {
  Client: typeof Tailordb.Client;
    file: {
        /**
         * Upload file to TailorDB
         */
        upload(
            namespace: string,
            typeName: string,
            fieldName: string,
            recordId: string,
            data: string | ArrayBuffer | Uint8Array | number[],
            options?: {
                contentType?: string;
            }
        ): Promise<{
            metadata: {
                fileSize: number;
                sha256sum: string;
            }
        }>;

        /**
         * Download file from TailorDB
         */
        download(
            namespace: string,
            typeName: string,
            fieldName: string,
            recordId: string
        ): Promise<{
            data: Uint8Array;
            metadata: {
                contentType: string;
                fileSize: number;
            }
        }>;

        /**
         * Open download stream for large files
         */
        openDownloadStream(
            namespace: string,
            typeName: string,
            fieldName: string,
            recordId: string
        ): Promise<TailordbFileStreamIterator>;

        /**
         * Delete file from TailorDB
         */
        delete(
            namespace: string,
            typeName: string,
            fieldName: string,
            recordId: string
        ): Promise<boolean>;

        /**
         * Get file metadata from TailorDB
         */
        getMetadata(
            namespace: string,
            typeName: string,
            fieldName: string,
            recordId: string
        ): Promise<{
            contentType: string;
            fileSize: number;
            sha256sum: string;
            lastUploadedAt: string;
        }>;
    };
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

declare namespace tailor.authconnection {
  /**
   * getConnectionToken returns the access token for an auth connection
   */
  function getConnectionToken(connectionName: string): Promise<any>;
}

declare namespace tailor.iconv {
  /**
   * Convert string from one encoding to another
   */
  function convert<T extends string>(
    str: string | Uint8Array | ArrayBuffer,
    fromEncoding: string,
    toEncoding: T
  ): T extends 'UTF8' | 'UTF-8' ? string : Uint8Array;

  /**
   * Convert buffer from one encoding to another
   */
  function convertBuffer<T extends string>(
    buffer: Uint8Array | ArrayBuffer,
    fromEncoding: string,
    toEncoding: T
  ): T extends 'UTF8' | 'UTF-8' ? string : Uint8Array;

  /**
   * Decode buffer to string
   */
  function decode<T extends string>(
    buffer: Uint8Array | ArrayBuffer,
    encoding: T
  ): T extends 'UTF8' | 'UTF-8' ? string : Uint8Array;

  /**
   * Encode string to buffer
   */
  function encode<T extends string>(
    str: string,
    encoding: T
  ): T extends 'UTF8' | 'UTF-8' ? string : Uint8Array;

  /**
   * Get list of supported encodings
   */
  function encodings(): string[];

  /**
   * Iconv class for compatibility with node-iconv
   */
  class Iconv {
    constructor(fromEncoding: string, toEncoding: string);
    convert(input: string | Uint8Array | ArrayBuffer): string | Uint8Array;
  }
}
