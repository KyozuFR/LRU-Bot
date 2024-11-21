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

// Charger le modèle 'users' et l'associer à l'instance Sequelize
const licences = require('./models/licences.js')(sequelize, Sequelize.DataTypes);
const users = require('./models/users.js')(sequelize, Sequelize.DataTypes, licences);
const groups = require('./models/groups.js')(sequelize, Sequelize.DataTypes);
const groups_users = require('./models/groups_users.js')(sequelize, Sequelize.DataTypes, users, groups);

// Exporter le modèle users pour l'utiliser dans d'autres parties de l'application
module.exports = { users, groups, groups_users, licences, sequelize };