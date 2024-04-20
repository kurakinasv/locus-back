import { Request } from 'express';

import { AuthUserRequest } from 'controllers/auth';
import User from 'models/user.model';
import { DefaultId } from 'typings/common';

export interface UserGetRequest extends Request {
  body: {
    id: DefaultId;
  };
}

export interface UserEditRequest extends AuthUserRequest {
  body: {
    id: DefaultId;
    name?: User['name'];
    surname?: User['surname'];
    email?: User['email'];
    password?: User['password'];
  };
}

export interface UserDeleteRequest extends AuthUserRequest {
  body: {
    id: DefaultId;
  };
}
