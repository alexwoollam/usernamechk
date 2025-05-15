import { saveToOutbox } from './outboxService.js'

export async function queueAvatarCreation(data) {
  return saveToOutbox('avatar.creation.requested', data)
}