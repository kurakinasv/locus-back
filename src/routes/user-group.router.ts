import { Router } from 'express';

import userGroupController from 'controllers/user-group';
import { authMiddleware } from 'middleware/auth';

const router = Router();

// /api/user-group
router.post('/join', authMiddleware, userGroupController.joinGroup);
router.put('/login', authMiddleware, userGroupController.loginToGroup);
router.put('/edit', authMiddleware, userGroupController.editUserGroup);
router.delete('/leave', authMiddleware, userGroupController.leaveGroup);

export default router;
