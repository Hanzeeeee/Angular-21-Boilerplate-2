import { Sequelize } from 'sequelize';
import config from '../../config';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {
  initialize
};

export default db;

async function initialize() {
  const { host, port, user, password, database, ssl } = config.db;

  const sequelize = new Sequelize(database, user, password, {
    host,
    port,
    dialect: 'mysql',
    logging: false,
    dialectOptions: ssl
      ? {
          ssl: {
            rejectUnauthorized: false
          }
        }
      : undefined
  });

  db.sequelize = sequelize;

  await sequelize.authenticate();

  db.Account = accountModel(sequelize);
  db.RefreshToken = refreshTokenModel(sequelize);

  db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
  db.RefreshToken.belongsTo(db.Account);

  await sequelize.sync();
}