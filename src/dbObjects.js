const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const lruBot = require('./models/lru-bot.js')(sequelize, Sequelize.DataTypes);

module.exports = { lruBot};