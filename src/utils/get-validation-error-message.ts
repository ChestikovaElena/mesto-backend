import { Error as MongooseError } from 'mongoose';

export const getValidationErrorMessage = (error: MongooseError.ValidationError) => {
  const message = Object.values(error.errors).map((val) => val.message);
  return message.join(' ');
};
