import Joi, { ObjectSchema } from 'joi';

export const ResetPasswordRequestSchema: ObjectSchema = Joi.object({
  email: Joi.string().required(),
  code: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});
