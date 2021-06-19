const Joi = require('joi');
const { HttpCode } = require('../helpers/constants');

const schemaSingup = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .required(),
  password: Joi.string().alphanum().min(8).required(),
});

const schemaLogin = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .optional(),
  password: Joi.string().alphanum().min(8).required(),
}).min(1);

const subscriptionUpdateSchema = Joi.object({
  subscription: Joi.any().valid('starter', 'pro', 'business').required(),
});

const validate = (schema, body, next) => {
  const { error } = schema.validate(body);
  if (error) {
    const [{ message }] = error.details;
    return next({
      status: HttpCode.BAD_REQUEST,
      message: `Field: ${message.replace(/"/g, '')}`,
      data: 'Not Found',
    });
  }
  next();
};
module.exports.validateSingup = (req, res, next) => {
  return validate(schemaSingup, req.body, next);
};
module.exports.validateLogin = (req, res, next) => {
  return validate(schemaLogin, req.body, next);
};
module.exports.validateSubscriptionUpdate = (req, res, next) => {
  return validate(subscriptionUpdateSchema, req.body, next);
};
