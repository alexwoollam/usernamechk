import { saveToOutbox } from './outboxService.js'
import bcrypt from 'bcrypt'

export async function queueParentCreation({ email, first_name, last_name, password }) {
  const hashedPassword = await bcrypt.hash(password, 12)

  return saveToOutbox('accounts.parent.created', {
    email,
    first_name,
    last_name,
    password: hashedPassword
  })
}