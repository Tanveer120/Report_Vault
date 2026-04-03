function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      const err = new Error(message);
      err.statusCode = 400;
      err.isOperational = true;
      return next(err);
    }

    req[source] = value;
    next();
  };
}

module.exports = { validate };
