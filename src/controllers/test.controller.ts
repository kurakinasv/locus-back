import { NextFunction, Request, Response } from 'express';

class Test {
  // GET /api/test
  getTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('test!');
      res.status(200).json({ message: 'Test route' });
    } catch (error) {
      next(error);
    }
  };
}

export default new Test();
