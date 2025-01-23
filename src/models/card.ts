import { model, Schema } from 'mongoose';
import { urlRegex } from '../constants';
import type { ICard } from "../types";

const cardSchema = new Schema<ICard>({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2.'],
    maxlength: [30, 'Максимальная длина поля "name" - 30.'],
    required: [true, 'Поле "name" должно быть заполнено.'],
  },
  link: {
    type: String,
    required: [true, 'Поле "link" должно быть заполнено.'],
    validate: {
      validator: (v: string) => urlRegex.test(v),
      message: 'Неправильный формат ссылки.',

    },
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: {
    type: [Schema.Types.ObjectId], default: [],
  },
}, {
  timestamps: true,
  versionKey: false,
});

export default model<ICard>('card', cardSchema);
