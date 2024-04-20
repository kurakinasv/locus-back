import { Router } from 'express';

import authController from 'controllers/auth';
import { loginMiddleware, registerMiddleware } from 'middleware/auth';

const router = Router();

// /api/auth
router.post('/login', loginMiddleware, authController.login);
router.post('/register', registerMiddleware, authController.register);
router.post('/logout', authController.logout);

export default router;
