import { Pool } from 'pg';

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

export default pool;
