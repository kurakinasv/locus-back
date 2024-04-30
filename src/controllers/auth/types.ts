import { Request } from 'express';

import User from 'models/user.model';

import { UUIDString } from 'typings/common';

export interface AuthUserRequest extends Request {
  user?: {
    id: UUIDString;
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
