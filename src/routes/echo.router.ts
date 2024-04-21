import { Router, Request, Response } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';

const router = Router();

// /api/
router.get('/', (req: Request, res: Response) => {
  res.status(HTTPStatusCodes.OK).json(`Server is running on port ${process.env.PORT}`);
});

export default router;
