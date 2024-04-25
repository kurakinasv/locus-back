import { JwtPayload } from 'jsonwebtoken';

import { UUIDString } from './common';

declare interface JWTToken extends JwtPayload {
  user?: {
    id: UUIDString;
  };
}
