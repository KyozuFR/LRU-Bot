// Importation des modules nécessaires
const path = require('node:path');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/**
 * Fonction principale pour initialiser et démarrer le client Discord bot.
 * Elle déploie les commandes et les événements, puis connecte le client.
 */
async function main() {
    console.log(process.env.TOKEN);
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    try {
        // Déployer les commandes et les événements
        await Promise.all([
            require('./deploy-commands')(client),
            require('./deploy-events')(client)
        ]);

        // Se connecter à Discord avec le token du bot
        await client.login(process.env.TOKEN);
    } catch (error) {
        console.error('Erreur lors de l\'initialisation :', error);
    }
}

// Exécuter la fonction principale
main();