import { model, Schema } from 'mongoose';
import { IUser } from '../types/user';

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2.'],
    maxlength: [30, 'Максимальная длина поля "name" - 30.'],
    required: [true, 'Поле "name" должно быть заполнено.'],
    unique: true,
  },
  about: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2.'],
    maxlength: [200, 'Максимальная длина поля "name" - 200.'],
    required: [true, 'Поле "about" должно быть заполнено.'],
  },
  avatar: {
    type: String,
    required: [true, 'Поле "avatar" должно быть заполнено.'],
  },
}, { versionKey: false });

export default model<IUser>('user', userSchema);
