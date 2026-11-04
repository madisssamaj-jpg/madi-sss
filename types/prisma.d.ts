declare module 'prisma/config' {
  export interface PrismaConfig {
    schema?: string;
    migrations?: { directory?: string };
    datasource?: { url?: string };
  }
  export function defineConfig(config: PrismaConfig): PrismaConfig;
}

