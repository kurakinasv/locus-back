import { check } from 'express-validator';

import { PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from 'config/auth';

export const loginMiddleware = [
  check('username', 'Введите корректный юзернейм').isLength({
    min: USERNAME_MIN_LENGTH,
    max: USERNAME_MAX_LENGTH,
  }),
  check('email', 'Введите корректный email').normalizeEmail().isEmail(),
  check('password', 'Введите пароль').exists(),
];

export const registerMiddleware = [
  check(
    'username',
    `Длина юзернейма — от ${USERNAME_MIN_LENGTH} до ${USERNAME_MAX_LENGTH} символов`
  ).isLength({
    min: USERNAME_MIN_LENGTH,
    max: USERNAME_MAX_LENGTH,
  }),
  check('email', 'Некорректный email').isEmail(),
  check('password', `Минимальная длина пароля - ${PASSWORD_MIN_LENGTH} символов`).isLength({
    min: PASSWORD_MIN_LENGTH,
  }),
];
