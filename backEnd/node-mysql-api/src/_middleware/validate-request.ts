
export default validateRequest;

function validateRequest(req: any, next: any, schema: any, source = 'body') {
  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  };

  const data = source === 'query' ? req.query : req.body;
  const { error, value } = schema.validate(data, options);

  if (error) {
    return next(`Validation error: ${error.details.map((x: any) => x.message).join(', ')}`);
  }

  if (source === 'query') {
    req.query = value;
  } else {
    req.body = value;
  }

  next();
}

