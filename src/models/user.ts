import { model, Model, Schema, Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { DEFAULT_USER, INCORRECT_EMAIL_OR_PASSWORD_ERROR, urlRegex } from '../constants';
import type { IUser } from '../types';
import UnauthorizedError from '../errors/unauthorized-error';

interface UserModel extends Model<IUser> {
  findUserByCredentials: (email: string, password: string) => Promise<Document<unknown, any, IUser>>
}

const userSchema = new Schema<IUser, UserModel>({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2.'],
    maxlength: [30, 'Максимальная длина поля "name" - 30.'],
    default: DEFAULT_USER.name,
  },
  about: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2.'],
    maxlength: [200, 'Максимальная длина поля "name" - 200.'],
    default: DEFAULT_USER.about,
  },
  avatar: {
    type: String,
    default: DEFAULT_USER.avatar,
    validate: {
      validator: (v: string) => urlRegex.test(v),
      message: 'Неправильный формат ссылки.',

    },
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Поле "email" должно быть заполнено.'],
    validate: {
      validator: (v: string) => validator.isEmail(v),
      message: 'Неправильный формат почты.',
    },
  },
  password: {
    type: String,
    required: [true, 'Поле "password" должно быть заполнено.'],
    minlength: [8, 'Минимальная длина поля "password" - 8.'],
    maxlength: [20, 'Минимальная длина поля "password" - 20.'],
    select: false,
  },
}, { versionKey: false });

userSchema.static('findUserByCredentials', function findUserByCredentials(email: string, password: string) {
  return this.findOne({ email }).select('+password').then((user) => {
    if (!user) {
      return (new UnauthorizedError(INCORRECT_EMAIL_OR_PASSWORD_ERROR));
    }

    return bcrypt.compare(password, user.password).then((matched) => {
      if (!matched) {
        return (new UnauthorizedError(INCORRECT_EMAIL_OR_PASSWORD_ERROR));
      }

      return user;
    });
  });
});

export default model<IUser, UserModel>('user', userSchema);
