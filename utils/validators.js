const Joi = require('joi');

exports.registerSchema = Joi.object({
  telegramId: Joi.string().required(),
  username: Joi.string().required(),
  referralCode: Joi.string().pattern(/^REF_[A-Z0-9]{8}$/)
});

exports.loginSchema = Joi.object({
  telegramId: Joi.string().required(),
});

exports.balanceSchema = Joi.object({
  telegramId: Joi.string().required(),
  balance: Joi.string()
});

exports.referralStatsSchema = Joi.object({
  limit: Joi.number().min(1).max(100),
  level: Joi.number().min(1)
});