declare module 'pg' {
  export interface PoolConfig {
    connectionString?: string;
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    database?: string;
    ssl?: boolean | { rejectUnauthorized?: boolean; ca?: string; key?: string; cert?: string };
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  }

  export interface QueryResult<T = any> {
    rows: T[];
    command: string;
    rowCount: number;
    oid: number;
    fields: any[];
  }

  export class PoolClient {
    query<T = any>(queryText: string, values?: any[]): Promise<QueryResult<T>>;
    release(err?: Error | boolean): void;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    connect(): Promise<PoolClient>;
    query<T = any>(queryText: string, values?: any[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
    on(event: 'error', listener: (err: Error, client: PoolClient) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }
}

