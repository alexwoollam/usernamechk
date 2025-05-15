const sanitizeInput = (req, res, next) => {
  for (const key in req.body) {
    if (!Object.prototype.hasOwnProperty.call(req.body, key)) continue

    const value = req.body[key]

    if (typeof value !== 'string') continue

    if (key.toLowerCase() === 'email') {
      req.body[key] = value.trim()
    } else {
      req.body[key] = value.replace(/[^a-zA-Z0-9]/g, '')
    }
  }

  next()
}

export default sanitizeInput
