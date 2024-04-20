export const returnTrimOrNull = (value: string | null) => {
  const trimmed = String(value).trim();
  return trimmed || null;
};

export const isRequiredString = (value: string | null | undefined) => {
  const trimmedValue = value && value.trim();

  return typeof value === 'string' && Boolean(trimmedValue);
};
