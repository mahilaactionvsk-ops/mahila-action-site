import path from 'path';
import fs from 'fs';
import type { Core } from '@strapi/strapi';

// Helper to log detailed AggregateError cause if encountered during startup
process.on('unhandledRejection', (reason: any) => {
  if (reason && (reason.name === 'AggregateError' || Array.isArray(reason?.errors))) {
    console.error('❌ [Database Connection Error] Detailed AggregateError breakdown:');
    if (Array.isArray(reason.errors)) {
      reason.errors.forEach((err: any, idx: number) => {
        console.error(`  Failure ${idx + 1}: ${err?.message || err}`);
        if (err?.stack) console.error(`  Stack: ${err.stack}`);
      });
    }
  }
});

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database => {
  const client = env('DATABASE_CLIENT', 'postgres');

  // Ensure sqlite directory exists if sqlite is selected
  if (client === 'sqlite') {
    const dbFilename = env('DATABASE_FILENAME', '.tmp/data.db');
    const dbPath = path.isAbsolute(dbFilename)
      ? dbFilename
      : path.join(__dirname, '..', '..', dbFilename);
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  const isSSL = env.bool('DATABASE_SSL', false);
  const sslConfig = isSSL
    ? {
        key: env('DATABASE_SSL_KEY', undefined),
        cert: env('DATABASE_SSL_CERT', undefined),
        ca: env('DATABASE_SSL_CA', undefined),
        capath: env('DATABASE_SSL_CAPATH', undefined),
        cipher: env('DATABASE_SSL_CIPHER', undefined),
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
      }
    : false;

  const connections = {
    mysql: {
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: sslConfig,
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      connection: {
        ...(env('DATABASE_URL')
          ? { connectionString: env('DATABASE_URL') }
          : {
              host: env('DATABASE_HOST', '127.0.0.1'),
              port: env.int('DATABASE_PORT', 5432),
              database: env('DATABASE_NAME', 'strapi'),
              user: env('DATABASE_USERNAME', 'strapi'),
              password: env('DATABASE_PASSWORD', 'strapi'),
            }),
        ssl: sslConfig,
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  if (!(client in connections)) {
    throw new Error(
      `Unsupported DATABASE_CLIENT: ${client}. Use "postgres", "mysql", or "sqlite".`
    );
  }

  type DatabaseClient = keyof typeof connections;

  return {
    connection: {
      client: client as DatabaseClient,
      ...connections[client as DatabaseClient],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  } as Core.Config.Database;
};

export default config;
