import { Router } from 'express';

import groupController from 'controllers/group';
import { authMiddleware } from 'middleware/auth';
import { authGroupLoginMiddleware } from './config';

const router = Router();

// /api/group
router.get('/group/:id', authMiddleware, groupController.getGroup);
router.post('/group', authMiddleware, groupController.createGroup);
router.put('/group', authGroupLoginMiddleware, groupController.editGroup);
router.put('/invite', authGroupLoginMiddleware, groupController.generateInviteCode);
router.delete('/group', authGroupLoginMiddleware, groupController.deleteGroup);
// todo: only for dev
router.get('/all', groupController.getAllGroups);

export default router;
