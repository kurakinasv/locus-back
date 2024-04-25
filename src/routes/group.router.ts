import { Router } from 'express';

import groupController from 'controllers/group';
import { authMiddleware } from 'middleware/auth';

const router = Router();

// /api/group
router.get('/group', authMiddleware, groupController.getGroup);
router.post('/group', authMiddleware, groupController.createGroup);
router.put('/group', authMiddleware, groupController.editGroup);
router.delete('/group', authMiddleware, groupController.deleteGroup);
// todo: only for dev
router.get('/all', groupController.getAllGroups);

export default router;
