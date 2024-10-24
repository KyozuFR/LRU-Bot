// Importation des modules nécessaires
const Sequelize = require('sequelize');

// Initialiser une nouvelle instance de Sequelize avec les paramètres de connexion
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: '../database.sqlite',
});

// Charger le modèle 'lru-bot' et l'associer à l'instance Sequelize
const lruBot = require('./models/lru-bot.js')(sequelize, Sequelize.DataTypes);

// Exporter le modèle lruBot pour l'utiliser dans d'autres parties de l'application
module.exports = { lruBot };