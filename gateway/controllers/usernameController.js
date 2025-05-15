import * as UsernameService from '../services/usernameService.js'
import pollForResult from '../utils/pollForResult.js'
import { validateUsername } from '../utils/validateUsername.js'

export async function checkUsername(req, res) {
  const { username } = req.body

  if (!username) {
    return res.status(400).json({ error: 'Username is required' })
  }

  validateUsername(username)

  const correlationId = await UsernameService.queueUsernameCheck(username)

  try {
    const payload = await pollForResult(correlationId)
    res.json(payload)
  } catch {
    res.status(504).json({ error: 'Timeout waiting for username check result' })
  }
}
