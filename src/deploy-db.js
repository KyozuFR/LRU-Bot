// Importation des modules nécessaires
const path = require('node:path');
const Sequelize = require('sequelize');

/**
 * Fonction pour déployer la base de données en utilisant Sequelize.
 * @throws {Error} - Si une erreur se produit lors du déploiement de la base de données.
 */
module.exports = async () => {
    // Initialiser une nouvelle instance de Sequelize avec les paramètres de connexion
    const sequelize = new Sequelize('database', 'username', 'password', {
        dialect: 'sqlite',
        storage: path.resolve(__dirname, '../database.sqlite'),
        logging: false,
    });

    // Charger le modèle 'users' et l'associer à l'instance Sequelize
    const licences = require('./models/licences.js')(sequelize, Sequelize.DataTypes);
    const users = require('./models/users.js')(sequelize, Sequelize.DataTypes);
    const groups = require('./models/groups.js')(sequelize, Sequelize.DataTypes);
    const groups_users = require('./models/groups_users.js')(sequelize, Sequelize.DataTypes);

    // Relation de users -> licences
    users.belongsTo(licences, {
        foreignKey: 'licencename',
        targetKey: 'name',
        onUpdate: 'RESTRICT',
        onDelete: 'SET NULL'
    });

    users.belongsTo(licences, {
        foreignKey: 'licenceyear',
        targetKey: 'year',
        onUpdate: 'RESTRICT',
        onDelete: 'SET NULL'
    });

    // Relation de groups_users -> users
    groups_users.belongsTo(users, {
        foreignKey: 'user_id',
        targetKey: 'discordid',
        onUpdate: 'RESTRICT',
        onDelete: 'CASCADE'
    });

    // Relation de groups_users -> groups
    groups_users.belongsTo(groups, {
        foreignKey: 'group_id',
        targetKey: 'id',
        onUpdate: 'RESTRICT',
        onDelete: 'CASCADE'
    });

    // Vérifier si l'option de forçage est activée via les arguments de la ligne de commande
    const force = process.argv.includes('--force') || process.argv.includes('-f');

    // Synchroniser les modèles avec la base de données
    sequelize.sync({ force }).then(async () => {
        console.log('Déploiement de la base de données terminé !');

        // Fermer la connexion à la base de données
        sequelize.close();
    }).catch(console.error);
}