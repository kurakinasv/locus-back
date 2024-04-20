export const returnTrimOrNull = (value: string) => {
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};
