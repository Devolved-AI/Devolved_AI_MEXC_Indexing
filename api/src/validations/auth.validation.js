const Joi = require('joi');

const authValidation = Joi.object({
    email: Joi.string().email().required()
});

const verifyOTPValidation = Joi.object({
    otp: Joi.string().length(6).pattern(new RegExp('^[0-9]+$')).required(),
    email: Joi.string().email().required()
});

module.exports = {
    authValidation,
    verifyOTPValidation,
};
