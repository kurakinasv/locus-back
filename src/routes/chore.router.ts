import { Router } from 'express';

import choreController from 'controllers/chore';

import { authGroupLoginMiddleware } from './config';

const router = Router();

// /api/chore
router.get('/chores', authGroupLoginMiddleware, choreController.getChores);
router.get('/chore/:id', authGroupLoginMiddleware, choreController.getChore);
router.post('/chore', authGroupLoginMiddleware, choreController.createChore);
router.put('/chore/:id', authGroupLoginMiddleware, choreController.editChore);
router.delete('/chore/:id', authGroupLoginMiddleware, choreController.deleteChore);

export default router;
