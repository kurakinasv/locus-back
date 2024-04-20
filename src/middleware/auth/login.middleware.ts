import { body, check, oneOf } from 'express-validator';

import { PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from 'config/auth';

export const loginMiddleware = [
  oneOf(
    [
      body('email', 'Введите корректный email').normalizeEmail().isEmail(),
      body('username', 'Введите корректный юзернейм').isLength({
        min: USERNAME_MIN_LENGTH,
        max: USERNAME_MAX_LENGTH,
      }),
    ],
    {
      message: 'Введите корректную почту или юзернейм',
    }
  ),
  check('password', 'Введите пароль').exists().notEmpty().isLength({
    min: PASSWORD_MIN_LENGTH,
  }),
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
