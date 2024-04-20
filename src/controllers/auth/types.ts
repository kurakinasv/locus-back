import { Request } from 'express';

import User from 'models/user.model';

import { DefaultId } from 'typings/common';

export interface AuthUserRequest extends Request {
  user?: {
    id: DefaultId;
  };
}

export interface UserLoginRequest extends Request {
  body: {
    username?: User['username'];
    email?: User['email'];
    password: User['password'];
  };
}

export interface UserRegisterRequest extends Request {
  body: {
    username: User['username'];
    email: User['email'];
    password: User['password'];
  };
}
