import { Sequelize } from 'sequelize';

abstract class DataBase<DataBaseT> {
  db: DataBaseT;

  constructor(dbInstance: DataBaseT) {
    this.db = dbInstance;
  }

  abstract connect(): Promise<void>;
}

class SequelizeDB extends DataBase<Sequelize> {
  constructor() {
    const instance = new Sequelize(
      process.env.DB_NAME || '',
      process.env.DB_USER || '',
      process.env.DB_PASSWORD,
      {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
      }
    );

    super(instance);
  }

  async connect(): Promise<void> {
    try {
      if (!process.env.DB_NAME || !process.env.DB_USER) {
        throw new Error('Параметры базы данных заданы не полностью');
      }

      await this.db.authenticate();
      await this.db.sync();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }
}

export default new SequelizeDB();
