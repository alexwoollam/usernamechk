import { Pool } from 'pg';
import logger from './logger.js';

const pool = new Pool({
  host: process.env.OUTBOX_HOST,
  port: parseInt(process.env.OUTBOX_PORT || '5432'),
  user: process.env.OUTBOX_USER,
  password: process.env.OUTBOX_PASS,
  database: process.env.OUTBOX_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const schemaSql = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS outbox (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  payload JSONB NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_datetime TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inbox (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  payload JSONB NOT NULL,
  consumed BOOLEAN DEFAULT false,
  received_datetime TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
`;

const initDb = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    await client.query(schemaSql);
    client.release();
    logger.info('Connected to Postgres and ensured schema exists');
  } catch (err) {
    logger.error('Database initialisation failed:', err);
    process.exit(1);
  }
};

export { pool, initDb };
