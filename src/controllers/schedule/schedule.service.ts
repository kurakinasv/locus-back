import { NextFunction } from 'express';

import { ApiError } from 'middleware/error';
import GroupModel from 'models/group.model';
import { Frequency, defaultFrequency } from 'models/schedule.model';
import UserGroupModel from 'models/user-group.model';

class ScheduleService {
  static getNextDateByFrequency = (
    currentDate: Date,
    frequency: Frequency = defaultFrequency,
    step: number = 1,
    offset: number = 0
  ) => {
    switch (frequency) {
      case 'daily':
        return new Date(currentDate.setDate(currentDate.getDate() + (step + offset)));
      case 'weekly':
        return new Date(currentDate.setDate(currentDate.getDate() + 7 * (step + offset)));
      case 'monthly':
        return new Date(currentDate.setMonth(currentDate.getMonth() + (step + offset)));
      // todo: implement custom frequency
      case 'custom':
        return new Date(currentDate);
      // dateEnd should be equal to dateStart
      case 'never':
        return new Date(currentDate);
      default:
        return new Date(currentDate);
    }
  };

  static checkIfUsersInGroup = async (
    userGroupIds: UserGroupModel['id'][],
    groupId: GroupModel['id'],
    next: NextFunction
  ) => {
    if (!userGroupIds) {
      return next(ApiError.badRequest('Выберите хотя бы одного пользователя'));
    }

    const foundUsersInGroup = await UserGroupModel.findAll({
      where: { groupId, id: userGroupIds },
    });

    console.log('usersInGroup', foundUsersInGroup.length, foundUsersInGroup);

    if (foundUsersInGroup.length !== userGroupIds.length) {
      return next(ApiError.badRequest('Пользователи не найдены в группе'));
    }

    return true;
  };
}

export default ScheduleService;
