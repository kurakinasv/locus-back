import { Router } from 'express';

import shoppingListController from 'controllers/shoppingList';

import { authGroupLoginMiddleware } from './config';

const router = Router();

// /api/shopping-list
router.get('/lists', authGroupLoginMiddleware, shoppingListController.getShoppingLists);
router.get('/list/:id', authGroupLoginMiddleware, shoppingListController.getShoppingList);
router.post('/list', authGroupLoginMiddleware, shoppingListController.createShoppingList);
router.put('/list/:id', authGroupLoginMiddleware, shoppingListController.editShoppingList);
router.delete('/list/:id', authGroupLoginMiddleware, shoppingListController.deleteShoppingList);

export default router;
