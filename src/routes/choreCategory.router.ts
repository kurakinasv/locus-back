import { Router } from 'express';

import choreCategoryController from 'controllers/choreCategory';

import { authGroupLoginMiddleware } from './config';

const router = Router();

// /api/chore/
router.get('/category', authGroupLoginMiddleware, choreCategoryController.getChoreCategories);
router.post('/category', authGroupLoginMiddleware, choreCategoryController.createChoreCategory);
router.put('/category/:id', authGroupLoginMiddleware, choreCategoryController.editChoreCategory);
router.delete(
  '/category/:id',
  authGroupLoginMiddleware,
  choreCategoryController.deleteChoreCategory
);

export default router;
