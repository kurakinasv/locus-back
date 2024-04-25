import { authMiddleware } from 'middleware/auth';
import { groupLoginMiddleware } from 'middleware/group-login';

export const authGroupLoginMiddleware = [authMiddleware, groupLoginMiddleware];
