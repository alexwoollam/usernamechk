import { Pool } from 'pg'
import cron from 'node-cron'

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

async function ensureArchiveTables(client) {
  await client.query(`CREATE TABLE IF NOT EXISTS outbox_archive (LIKE outbox INCLUDING ALL)`);
  await client.query(`CREATE TABLE IF NOT EXISTS inbox_archive (LIKE inbox INCLUDING ALL)`);
}

async function archiveAndClean() {
  const client = await pool.connect();

  try {
    await ensureArchiveTables(client);

    await client.query('BEGIN');

    await client.query(`
      INSERT INTO outbox_archive
      SELECT * FROM outbox
      WHERE sent = true AND sent_datetime < NOW() - INTERVAL '1 hour'
    `);

    await client.query(`
      DELETE FROM outbox
      WHERE sent = true AND sent_datetime < NOW() - INTERVAL '1 hour'
    `);

    await client.query(`
      DELETE FROM outbox_archive
      WHERE sent_datetime < NOW() - INTERVAL '2 days'
    `);

    await client.query(`
      INSERT INTO inbox_archive
      SELECT * FROM inbox
      WHERE consumed = true AND received_datetime < NOW() - INTERVAL '1 hour'
    `);

    await client.query(`
      DELETE FROM inbox
      WHERE consumed = true AND received_datetime < NOW() - INTERVAL '1 hour'
    `);

    await client.query(`
      DELETE FROM inbox_archive
      WHERE received_datetime < NOW() - INTERVAL '2 days'
    `);

    await client.query('COMMIT');

    console.log('Archive and cleanup completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Archive and cleanup failed', err);
  } finally {
    client.release();
  }
}

cron.schedule('* * * * *', () => {
  // Runs every day at min
  archiveAndClean()
})

console.log('Cleanup service started, scheduled to run min.')
