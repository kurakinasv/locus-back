import { Request } from 'express';

import { DefaultId } from 'typings/common';

export interface AuthUserRequest extends Request {
  user?: {
    userId: DefaultId;
  };
}

export interface UserLoginRequest extends Request {
  body: {
    emailOrUsername: string;
    password: string;
  };
}
