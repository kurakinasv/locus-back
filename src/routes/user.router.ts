import { Router } from 'express';

import userController from 'controllers/user/index.js';

const router = Router();

// /api/user
router.get('/user', userController.getUser);
router.post('/user', userController.createUser);
router.put('/user', userController.editUser);
router.delete('/user', userController.deleteUser);

export default router;
