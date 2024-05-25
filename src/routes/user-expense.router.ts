import { Router } from 'express';

import userExpenseController from 'controllers/user-expense';

import { authGroupLoginMiddleware } from './config';

const router = Router();

// /api/user-expense/
router.get('/all', authGroupLoginMiddleware, userExpenseController.getAllUserExpenses);
router.get('/user-expenses', authGroupLoginMiddleware, userExpenseController.getUserExpenses);
router.get('/group', authGroupLoginMiddleware, userExpenseController.getGroupUserDebts);
router.put('/debt/:id', authGroupLoginMiddleware, userExpenseController.closeUserDebt);

export default router;
