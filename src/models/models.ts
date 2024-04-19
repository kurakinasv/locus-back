import { DataTypes } from 'sequelize';

import sequelize from 'app/database.js';
import { Tables } from 'config/tables.js';

export const Test = sequelize.db.define(Tables.Test, {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
});
