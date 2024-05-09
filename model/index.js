const Sequelize = require('sequelize');

const config = {
  mariaDB: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
};

const db = {};
const sequelizeInfo = {
  host: config.mariaDB.host,
  port: config.mariaDB.port,
  dialect: 'mariadb',
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
  logging: false,
};

const sequelize = new Sequelize(
    config.mariaDB.database,
    config.mariaDB.username,
    config.mariaDB.password,
    sequelizeInfo,
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.company = require('./company')(sequelize, Sequelize);
db.media = require('./media')(sequelize, Sequelize);
db.asset = require('./asset')(sequelize, Sequelize);
db.profile = require('./profile')(sequelize, Sequelize);

module.exports = db;
