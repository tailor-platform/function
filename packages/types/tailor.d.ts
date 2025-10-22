declare namespace Tailordb {
  class Client {
    constructor(config: { namespace: string });
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
  file: TailorDBFileAPI;
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
    encoding: string
  ): string;

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

// TailorDB File Extension Types

/**
 * Custom error class for TailorDB File operations
 */
declare class TailorDBFileError extends Error {
  name: 'TailorDBFileError';
  code?: 'INVALID_PARAMS' | 'INVALID_DATA_TYPE' | 'OPERATION_FAILED' | 'DELETE_FAILED' | 'STREAM_OPEN_FAILED' | 'STREAM_READ_ERROR' | 'STREAM_ERROR';
  cause?: unknown;
}

/**
 * Upload response metadata
 */
interface UploadMetadata {
  fileSize: number;
  sha256sum: string;
}

/**
 * Download response metadata
 */
interface DownloadMetadata {
  contentType: string;
  fileSize: number;
}

/**
 * File metadata (for getMetadata API)
 */
interface FileMetadata {
  contentType: string;
  fileSize: number;
  sha256sum: string;
  urlPath: string;
  lastUploadedAt?: string;
}

/**
 * Stream metadata (first chunk)
 */
interface StreamMetadata {
  contentType: string;
  fileSize: number;
  sha256sum: string;
}

/**
 * Upload options interface
 */
interface FileUploadOptions {
  contentType?: string;
}

/**
 * Upload response interface
 */
interface FileUploadResponse {
  metadata: UploadMetadata;
}

/**
 * Download response interface
 */
interface FileDownloadResponse {
  data: Uint8Array;
  metadata: DownloadMetadata;
}

/**
 * Stream chunk types
 */
type StreamValue =
  | { type: 'metadata'; metadata: StreamMetadata }
  | { type: 'chunk'; data: Uint8Array; position: number }
  | { type: 'complete' };

/**
 * Stream iterator interface
 */
interface FileStreamIterator extends AsyncIterableIterator<StreamValue> {
  next(): Promise<IteratorResult<StreamValue>>;
  close(): Promise<void>;
}

/**
 * TailorDB File API
 */
interface TailorDBFileAPI {
  /**
   * Upload a file to TailorDB
   */
  upload(
    namespace: string,
    typeName: string,
    fieldName: string,
    recordId: string,
    data: string | ArrayBuffer | Uint8Array | number[],
    options?: FileUploadOptions
  ): Promise<FileUploadResponse>;

  /**
   * Download a file from TailorDB
   */
  download(
    namespace: string,
    typeName: string,
    fieldName: string,
    recordId: string
  ): Promise<FileDownloadResponse>;

  /**
   * Delete a file from TailorDB
   */
  delete(
    namespace: string,
    typeName: string,
    fieldName: string,
    recordId: string
  ): Promise<void>;

  /**
   * Get file metadata from TailorDB
   */
  getMetadata(
    namespace: string,
    typeName: string,
    fieldName: string,
    recordId: string
  ): Promise<FileMetadata>;

  /**
   * Open a download stream for large files
   */
  openDownloadStream(
    namespace: string,
    typeName: string,
    fieldName: string,
    recordId: string
  ): Promise<FileStreamIterator>;
}

declare namespace tailor.workflow {
    /**
     * Specifies the machine user that should be used to execute the workflow.
     * This allows workflows to run with specific authentication context.
     */
    interface AuthInvoker {
        /** The namespace where the machine user is defined */
        namespace: string;
        /** The name of the machine user to use for workflow execution */
        machineUserName: string;
    }

    /**
     * Options for triggering a workflow
     */
    interface TriggerWorkflowOptions {
        /** Optional authentication invoker to specify which machine user should execute the workflow */
        authInvoker?: AuthInvoker;
    }

    /**
     * Triggers a workflow and returns its execution ID.
     *
     * @param workflow_name - The name of the workflow to trigger
     * @param args - Optional arguments to pass to the workflow
     * @param options - Optional configuration including authentication settings
     * @returns A Promise that resolves to the workflow execution ID (UUID format)
     *
     * @example
     * ```typescript
     * // Basic usage
     * const executionId = await tailor.workflow.triggerWorkflow('myWorkflow', { data: 'value' });
     *
     * // With authentication invoker
     * const executionId = await tailor.workflow.triggerWorkflow(
     *   'myWorkflow',
     *   { data: 'value' },
     *   { authInvoker: { namespace: 'myNamespace', machineUserName: 'myUser' } }
     * );
     * ```
     */
    function triggerWorkflow(
        workflow_name: string,
        args?: any,
        options?: TriggerWorkflowOptions
    ): Promise<string>;

    /**
     * Triggers a job function and returns its result.
     *
     * @param job_name - The name of the job function to trigger
     * @param args - Optional arguments to pass to the job function
     * @returns The result returned by the job function. The return type depends on the specific job function
     implementation.
     */
    function triggerJobFunction(job_name: string, args?: any): any;
}