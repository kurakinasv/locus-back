import { Router } from 'express';

import shoppingListItemController from 'controllers/shoppingListItem';

import { authGroupLoginMiddleware } from './config';

const router = Router();

// /api/shopping-list/:listId
router.get('/:listId/items', authGroupLoginMiddleware, shoppingListItemController.getListItems);
router.post('/:listId/item', authGroupLoginMiddleware, shoppingListItemController.createListItem);
router.put('/:listId/item/:id', authGroupLoginMiddleware, shoppingListItemController.editListItem);
router.delete(
  '/:listId/item/:id',
  authGroupLoginMiddleware,
  shoppingListItemController.deleteListItem
);

export default router;
