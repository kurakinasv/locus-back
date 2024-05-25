import { Currency, SplitMethod } from 'models/expense.model';

export const availableCurrency: Currency[] = ['RUB', 'USD', 'EUR'];

export const splitMethods: SplitMethod[] = ['equally', 'unequally', 'personal'];

export const expenseCategoryIconsNames = [
  'other',
  'bath',
  'cart',
  'kitchenSet',
  'paw',
  'plant',
  'soap',
  'sprayBottle',
  'tshirt',
  'washingMachine',
] as const;

export type ExpenseCategoryIcon = (typeof expenseCategoryIconsNames)[number];
