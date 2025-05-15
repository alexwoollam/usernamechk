import * as ParentService from '../services/parentService.js'

export async function createParentAccount(req, res) {
  const { email, first_name, last_name, password } = req.body

  await ParentService.queueParentCreation({ email, first_name, last_name, password })

  res.status(202).json({ message: 'Parent account creation event queued' })
}