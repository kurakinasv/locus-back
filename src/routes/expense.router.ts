import { Router } from 'express';

import expenseController from 'controllers/expense';

import { authGroupLoginMiddleware } from './config';

const router = Router();

// /api/expense
router.get('/expenses', authGroupLoginMiddleware, expenseController.getExpenses);
router.get('/expense/:id', authGroupLoginMiddleware, expenseController.getExpense);
router.post('/expense', authGroupLoginMiddleware, expenseController.createExpense);
router.put('/expense/:id', authGroupLoginMiddleware, expenseController.editExpense);
router.delete('/expense/:id', authGroupLoginMiddleware, expenseController.deleteExpense);

export default router;
