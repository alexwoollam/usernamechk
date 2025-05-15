import * as AvatarService from '../services/avatarService.js'
import pollForResult from '../utils/pollForResult.js'
import { validateAvatar } from '../utils/validateAvatar.js'

export async function createAvatar(req, res) {
  const { avatar, colorScheme } = req.body

  if (!validateAvatar(avatar)) {
    return res.status(400).json({ error: 'Valid avatar data is required' })
  }

  const correlationId = await AvatarService.queueAvatarCreation({ avatar, colorScheme })

  try {
    const payload = await pollForResult(correlationId)
    res.json(payload)
  } catch {
    res.status(504).json({ error: 'Timeout waiting for avatar creation result' })
  }
}
