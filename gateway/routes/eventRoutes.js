import express from 'express'
import { saveToOutbox } from '../services/outboxService.js';
import {pool} from '../services/dbConnection.js'

const router = express.Router()

router.post('/username-check', async (req, res) => {

  const { username } = req.body

  if (!username) {
    return res.status(400).json({ error: 'Username is required' })
  }

  try {
    const correlationId = await saveToOutbox('username.check.requested', { username });
    const timeout = 5000
    const pollInterval = 250
    const start = Date.now()

    while (Date.now() - start < timeout) {
      const result = await pool.query(
        'SELECT payload FROM inbox WHERE id = $1',
        [correlationId]
      )

      if (result.rows.length > 0) {
        return res.json(result.rows[0].payload)
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    return res.status(504).json({ error: 'Timeout waiting for username check result' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Username check failed' })
  }
})

export default router
