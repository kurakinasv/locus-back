import { Router } from 'express';

import userGroupController from 'controllers/user-group';
import { authMiddleware } from 'middleware/auth';

import { authGroupLoginMiddleware } from './config';

const router = Router();

// /api/user-group
router.get('/current', authMiddleware, userGroupController.getCurrentUserGroup);
router.get('/user-groups', authMiddleware, userGroupController.getUserGroups);
router.post('/join', authMiddleware, userGroupController.joinGroup);
router.put('/login', authMiddleware, userGroupController.loginToGroup);
router.put('/edit', authGroupLoginMiddleware, userGroupController.editUserGroup);
router.delete('/leave', authGroupLoginMiddleware, userGroupController.leaveGroup);

export default router;
