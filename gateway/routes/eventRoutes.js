import express from 'express'
import { saveToOutbox } from '../services/outboxService.js';
import {pool} from '../services/dbConnection.js'
import sanitizeInput from '../middleware/sanitizeInput.js';
import { validateUsername } from '../services/usernameValidationService.js'; // Import the validation function

const router = express.Router()

router.post('/username-check', sanitizeInput, async (req, res) => {

  const { username } = req.body

  if (!username) {
    return res.status(400).json({ error: 'Username is required' })
  }

  try {

    validateUsername(username);

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
    res.status(500).json({ error: 'Username check failed', message: err.message || 'An unknown error occurred' })
  }
})

function isValidAvatar(avatar) {
  const requiredLayers = ['hand', 'horn', 'mouth', 'ear', 'eye', 'skin', 'leg', 'tail']
  return requiredLayers.every(layer => Number.isInteger(avatar[layer]) && avatar[layer] > 0)
}

router.post('/user-avatar', async (req, res) => {
  const { avatar, colorScheme } = req.body

  if (!avatar || !isValidAvatar(avatar)) {
    return res.status(400).json({ error: 'Valid avatar data is required' })
  }

  try {
    const correlationId = await saveToOutbox('avatar.creation.requested', { avatar, colorScheme })

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

    return res.status(504).json({ error: 'Timeout waiting for avatar creation result' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Avatar creation failed', message: err.message || 'An unknown error occurred' })
  }
})

export default router
