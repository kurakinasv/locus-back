import { Router } from 'express';

import userController from 'controllers/user/index.js';
import { authMiddleware } from 'middleware/auth';

const router = Router();

// /api/user
router.get('/user', authMiddleware, userController.getUser);
router.put('/user', authMiddleware, userController.editUser);
router.delete('/user', authMiddleware, userController.deleteUser);
// todo: only for dev
router.get('/all', userController.getAllUsers);

export default router;
