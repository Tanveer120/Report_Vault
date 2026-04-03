const Joi = require('joi');

const executeReportSchema = Joi.object().pattern(Joi.string(), Joi.any());

module.exports = {
  executeReportSchema,
};
