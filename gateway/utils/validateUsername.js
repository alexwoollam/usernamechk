export function validateUsername(username) {
  const pattern = /^[a-zA-Z0-9_]{3,16}$/
  if (!pattern.test(username)) {
    throw new Error('Username must be 3-16 characters and alphanumeric with optional underscore')
  }
}
