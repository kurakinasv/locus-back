import { Router } from 'express';

import testController from 'controllers/test.controller.js';

const router = Router();

// /api/test/get
router.get('/', testController.getTest);

export default router;
