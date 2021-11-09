// Importation Sequelize

const { Sequelize } = require('sequelize');

// 2. Create an instance of sequelize
sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: true
  }
});

module.exports = sequelize;