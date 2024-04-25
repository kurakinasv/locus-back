import { Router } from 'express';

import choreController from 'controllers/chore';
import { authMiddleware } from 'middleware/auth';

const router = Router();

// /api/chore
router.get('/chores', authMiddleware, choreController.getChores);
router.post('/chore', authMiddleware, choreController.createChore);
router.put('/chore/:id', authMiddleware, choreController.editChore);
router.delete('/chore/:id', authMiddleware, choreController.deleteChore);

export default router;
