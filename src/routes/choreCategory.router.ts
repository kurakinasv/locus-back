import { Router } from 'express';

import choreCategoryController from 'controllers/choreCategory';
import { authMiddleware } from 'middleware/auth';

const router = Router();

// /api/chore/
router.get('/category', authMiddleware, choreCategoryController.getChoreCategories);
router.post('/category', authMiddleware, choreCategoryController.createChoreCategory);
router.put('/category', authMiddleware, choreCategoryController.editChoreCategory);
router.delete('/category', authMiddleware, choreCategoryController.deleteChoreCategory);

export default router;
