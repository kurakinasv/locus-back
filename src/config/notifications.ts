export enum NotificationType {
  // group
  groupSettingsChanged = 'groupSettingsChanged',
  memberAdded = 'memberAdded',
  memberRemoved = 'memberRemoved',

  // user
  userExitedGroup = 'userExitedGroup',
  userJoinedGroup = 'userJoinedGroup',

  // chore
  choreCreated = 'choreCreated',
  choreUpdated = 'choreUpdated',
  choreDeleted = 'choreDeleted',

  // schedule
  scheduleCreated = 'scheduleCreated',
  scheduleUpdated = 'scheduleUpdated',
  scheduleDeleted = 'scheduleDeleted',

  // expense
  expenseCreated = 'expenseCreated',
  expenseUpdated = 'expenseUpdated',
  expenseDeleted = 'expenseDeleted',

  // shopping list
  shoppingListCreated = 'shoppingListCreated',
  shoppingListUpdated = 'shoppingListUpdated',
  shoppingListDeleted = 'shoppingListDeleted',
}

export const NOTIFICATION_MESSAGES: Record<NotificationType, string> = {
  groupSettingsChanged: 'изменил настройки группы',
  memberAdded: 'добавил пользователя',
  memberRemoved: 'удалил пользователя',

  userJoinedGroup: 'присоединился к группе',
  userExitedGroup: 'покинул группу',

  choreCreated: 'создал новую задачу',
  choreUpdated: 'обновил задачу',
  choreDeleted: 'удалил задачу',

  scheduleCreated: 'создал новое расписание',
  scheduleUpdated: 'обновил расписание',
  scheduleDeleted: 'удалил расписание',

  expenseCreated: 'занёс новую трату',
  expenseUpdated: 'обновил информацию о трате',
  expenseDeleted: 'удалил информацию о трате',

  shoppingListCreated: 'создал новый список покупок',
  shoppingListUpdated: 'обновил список покупок',
  shoppingListDeleted: 'удалил список покупок',
};

export const formNotification = ({
  userName,
  messageType,
  additionalInfo = '',
}: {
  userName: string;
  messageType: NotificationType;
  additionalInfo?: string;
}) => {
  return `${userName} ${NOTIFICATION_MESSAGES[messageType]} ${additionalInfo}`.trim();
};
