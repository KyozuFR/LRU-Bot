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
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: path.resolve(__dirname, '../database.sqlite'),
    });

    // Charger le modèle 'lru-bot' et l'associer à l'instance Sequelize
    require('./models/licences.js')(sequelize, Sequelize.DataTypes);
    require('./models/users.js')(sequelize, Sequelize.DataTypes);
    require('./models/groups.js')(sequelize, Sequelize.DataTypes);
    require('./models/groups_users.js')(sequelize, Sequelize.DataTypes);

    // Vérifier si l'option de forçage est activée via les arguments de la ligne de commande
    const force = process.argv.includes('--force') || process.argv.includes('-f');

    // Synchroniser les modèles avec la base de données
    sequelize.sync({ force }).then(async () => {
        console.log('Déploiement de la base de données terminé !');

        // Fermer la connexion à la base de données
        sequelize.close();
    }).catch(console.error);
}