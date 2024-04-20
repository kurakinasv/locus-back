import { JwtPayload } from 'jsonwebtoken';

import { DefaultId } from './common';

declare interface JWTToken extends JwtPayload {
  user?: {
    id: DefaultId;
  };
}
