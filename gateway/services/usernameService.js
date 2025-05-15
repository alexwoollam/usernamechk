import { saveToOutbox } from './outboxService.js'

export async function queueUsernameCheck(username) {
  return saveToOutbox('username.check.requested', { username })
}
