import { Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { ApiError } from 'middleware/error';
import ScheduleDateModel from 'models/scheduleDate.model';

import { ScheduleDateEditRequest } from './types';

class ScheduleDateController {
  // PUT /api/schedule/task/:id
  editScheduleDate = async (req: ScheduleDateEditRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { completed, completedAt, isAssigned } = req.body;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.unauthorized('Не передан id группы'));
      }

      const scheduleDate = await ScheduleDateModel.findOne({ where: { id } });
      console.log('editScheduleDate scheduleDate', scheduleDate);

      if (!scheduleDate) {
        return next(ApiError.notFound('Запланированная задача не найдена'));
      }

      if (completed !== undefined) {
        scheduleDate.completed = completed;
        scheduleDate.completedAt = completed ? new Date(completedAt) : null;
      }

      if (isAssigned) {
        scheduleDate.isAssigned = isAssigned;
      }

      const editedSchedulDate = await scheduleDate.save();

      res.status(HTTPStatusCodes.OK).json(editedSchedulDate);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`editScheduleDate: ${err.message}`));
      }
    }
  };
}

export default new ScheduleDateController();
