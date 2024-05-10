import path from 'path';

export const getImagePath = (fileName: string) =>
  path.resolve(__dirname, '../..', 'static', fileName);
