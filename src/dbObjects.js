// Importation des modules nécessaires
const path = require('node:path');
const Sequelize = require('sequelize');

// Initialiser une nouvelle instance de Sequelize avec les paramètres de connexion
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: path.resolve(__dirname, '../database.sqlite'),
});

// Charger le modèle 'lru-bot' et l'associer à l'instance Sequelize
const users = require('./models/users.js')(sequelize, Sequelize.DataTypes);

// Exporter le modèle users pour l'utiliser dans d'autres parties de l'application
module.exports = { users };