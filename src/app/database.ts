import path from 'path';
import { Sequelize } from 'sequelize-typescript';

abstract class DataBase<DataBaseT> {
  db: DataBaseT;

  constructor(dbInstance: DataBaseT) {
    this.db = dbInstance;
  }

  abstract connect(): Promise<void>;
}

class SequelizeDB extends DataBase<Sequelize> {
  constructor() {
    const instance = new Sequelize({
      dialect: 'postgres',
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      models: [path.join(__dirname, '../models/*.model.js')],
    });

    super(instance);
  }

  async connect(): Promise<void> {
    try {
      await this.db.authenticate();
      await this.db.sync();
    } catch (error) {
      if (error instanceof Error) {
        // eslint-disable-next-line no-console
        console.error(error.message);
      }
    }
  }
}

export default new SequelizeDB();
