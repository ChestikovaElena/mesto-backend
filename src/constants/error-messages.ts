const CARDS_BAD_REQUEST = "Переданы некорректные данные при создании карточки.";
const CARDS_NOT_FOUND_CARD = "Передан несуществующий _id карточки.";
const CARD_NOT_FOUND_ON_DELETE = "Карточка с указанным _id не найдена.";
const CREATE_USER_CONFLICT_ERROR = "Пользователь с таким email уже существует.";
const USER_CANNOT_DELETE_CARD = "Пользователь не может удалить карточку.";
const LIKE_CARD_BAD_REQUEST = "Переданы некорректные данные для постановки лайка.";
const DISLIKE_CARD_BAD_REQUEST = "Переданы некорректные данные для снятия лайка.";
const USERS_CREATE_BAD_REQUEST = "Переданы некорректные данные при создании пользователя.";
const USERS_UPDATE_BAD_REQUEST = "Переданы некорректные данные при обновлении профиля.";
const USERS_UPDATE_AVATAR_BAD_REQUEST = "Переданы некорректные данные при обновлении аватара.";
const USERS_NOT_FOUND = "Пользователь с указанным _id не найден.";
const SERVER_ERROR = "На сервере произошла ошибка.";
const NON_EXISTENT_ADDRESS = "Запрашиваемый ресурс не найден.";
const UNAUTHORIZED_ERROR = "Необходима авторизация.";

export {
  CARDS_BAD_REQUEST,
  CARDS_NOT_FOUND_CARD,
  CARD_NOT_FOUND_ON_DELETE,
  CREATE_USER_CONFLICT_ERROR,
  USER_CANNOT_DELETE_CARD,
  LIKE_CARD_BAD_REQUEST,
  DISLIKE_CARD_BAD_REQUEST,
  USERS_CREATE_BAD_REQUEST,
  USERS_UPDATE_BAD_REQUEST,
  USERS_UPDATE_AVATAR_BAD_REQUEST,
  USERS_NOT_FOUND,
  SERVER_ERROR,
  NON_EXISTENT_ADDRESS,
  UNAUTHORIZED_ERROR,
};
