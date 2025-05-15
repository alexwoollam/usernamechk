import { pool } from '../services/dbConnection.js'

export default async function pollForResult(correlationId, timeout = 5000, pollInterval = 250) {
  const start = Date.now()

  while (Date.now() - start < timeout) {
    const result = await pool.query(
      'SELECT payload FROM inbox WHERE id = $1',
      [correlationId]
    )

    if (result.rows.length > 0) {
      return result.rows[0].payload
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  throw new Error('Timeout waiting for result')
}
