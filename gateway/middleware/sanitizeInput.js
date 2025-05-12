const sanitizeInput = (req, res, next) => {
  for (let key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      const value = req.body[key];

      if (typeof value === 'string') {
        req.body[key] = value.replace(/[^a-zA-Z0-9]/g, '');
      }
    }
  }

  next();
};

export default sanitizeInput;
