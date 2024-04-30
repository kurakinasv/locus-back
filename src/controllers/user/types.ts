import { AuthUserRequest } from 'controllers/auth';
import User from 'models/user.model';
import { UUIDString } from 'typings/common';

export interface UserEditRequest extends AuthUserRequest {
  body: {
    id: UUIDString;
    name?: User['name'];
    surname?: User['surname'];
    email?: User['email'];
    password?: User['password'];
  };
}

export interface UserDeleteRequest extends AuthUserRequest {
  body: {
    id: UUIDString;
  };
}
