// Importation des modules nécessaires
const path = require('node:path');
const Sequelize = require('sequelize');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/**
 * Fonction principale pour initialiser et démarrer le client Discord bot.
 * Elle déploie les commandes et les événements, puis connecte le client.
 */
async function main() {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
/**info de connection */
    const sequelize = new Sequelize('database', 'user', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        // SQLite only
        storage: 'database.sqlite',
    });

    try {
        // Déployer les commandes et les événements
        await Promise.all([
            require('./deploy-commands')(client),
            require('./deploy-events')(client)
        ]);

    const Tags = sequelize.define('LRUBOT', {
        discordid: {
            type: Sequelize.STRING,
            unique: true,
        },
        moodlelink: Sequelize.TEXT,
        lruid: Sequelize.STRING,
        
    });
    // une fois les test terminé, le mettre en client.onready
    await Tags.sync(); // Crée la table si elle n'existe pas (pour la whipe out {force: true})
        

        // Se connecter à Discord avec le token du bot
    await client.login(process.env.TOKEN);
    } catch (error) {
        console.error('Erreur lors de l\'initialisation :', error);
    }
}

// Exécuter la fonction principale
main();