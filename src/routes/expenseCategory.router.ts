import { Router } from 'express';

import expenseCaregoryController from 'controllers/expenseCategory';

import { authGroupLoginMiddleware } from './config';

const router = Router();

// /api/expense
router.get('/categories', authGroupLoginMiddleware, expenseCaregoryController.getExpenseCategories);
router.post('/category', authGroupLoginMiddleware, expenseCaregoryController.createExpenseCategory);
router.put(
  '/category/:id',
  authGroupLoginMiddleware,
  expenseCaregoryController.editExpenseCategory
);
router.delete(
  '/category/:id',
  authGroupLoginMiddleware,
  expenseCaregoryController.deleteExpenseCategory
);

export default router;
