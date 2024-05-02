import { Router } from 'express';

import userExpenseController from 'controllers/user-expense';

import { authGroupLoginMiddleware } from './config';

const router = Router();

// /api/user-expense/
router.get('/all', authGroupLoginMiddleware, userExpenseController.getAllUserExpenses);
router.get('/group', authGroupLoginMiddleware, userExpenseController.getGroupUserExpenses);

export default router;
