const Joi = require("joi");
const moment = require("moment");
const since = moment().format("D/MMM/YYYY");

const schemas = {
  accPOST: Joi.object().keys({
    date: Joi.date()
      .min(`${since}`)
      .max(`${since}`)
      .required(),
    text: Joi.string()
      .min(1)
      .max(30)
      .required(),
    amount: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .positive()
      .required(),
    typeSelect: Joi.any()
      .valid(["-", "+"])
      .required(),
    createBy: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
  })
};
module.exports = schemas;
