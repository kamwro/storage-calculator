import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
const envPath = path.resolve(__dirname, '../../../.env');
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.warn('Failed to load .env from:', envPath, result.error);
  // Try loading from current working directory as fallback
  dotenv.config();
} else {
  console.log('Loaded .env from:', envPath);
}

const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();

let options: DataSourceOptions;

if (dbType === 'sqlite') {
  // In-memory or file-based SQLite for local/e2e runs
  const dbFile = process.env.DB_FILE || ':memory:';
  const sync = String(process.env.TYPEORM_SYNC || 'true').toLowerCase() === 'true';
  const drop = String(process.env.TYPEORM_DROP_SCHEMA || 'true').toLowerCase() === 'true';
  options = {
    type: 'sqlite',
    database: dbFile,
    entities: [__dirname + '/entities/*.{ts,js}'],
    migrations: [__dirname + '/migrations/*.{ts,js}'],
    synchronize: sync,
    dropSchema: drop,
  } as DataSourceOptions;
} else {
  // Default: Postgres (dev/prod)
  options = {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'backend',
    entities: [__dirname + '/entities/*.{ts,js}'],
    migrations: [__dirname + '/migrations/*.{ts,js}'],
    synchronize: false,
  } as DataSourceOptions;
}

export const AppDataSource = new DataSource(options);
