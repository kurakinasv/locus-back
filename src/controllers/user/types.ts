import { Request } from 'express';

import User from 'models/user.model';
import { DefaultId } from 'typings/common';

export interface UserGetRequest extends Request {
  body: {
    id: DefaultId;
  };
}

export interface UserCreateRequest extends Request {
  body: {
    username: User['username'];
    email: User['email'];
    password: User['password'];
  };
}

export interface UserEditRequest extends Request {
  body: {
    id: DefaultId;
    name?: User['name'];
    surname?: User['surname'];
    email?: User['email'];
    password?: User['password'];
  };
}

export interface UserDeleteRequest extends Request {
  body: {
    id: DefaultId;
  };
}
