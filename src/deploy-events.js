// Importation des modules nécessaires
const fs = require('node:fs');
const path = require('node:path');

/**
 * Fonction pour charger et enregistrer tous les gestionnaires d'événements pour le client Discord.
 * @param {Client} client - L'instance du client Discord.
 */
module.exports = async (client) => {
    // Définir le chemin vers le répertoire des événements et filtrer les fichiers JavaScript
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    try {
        // Charger et enregistrer tous les événements
        for (const file of eventFiles) {
            const event = require(path.join(eventsPath, file));
            const handler = (...args) => event.execute(...args);
            event.once ? client.once(event.name, handler) : client.on(event.name, handler);
        }
        console.log(`Déploiement des événements terminé !`);
    } catch (error) {
        // Enregistrer et relancer toutes les erreurs rencontrées lors du chargement des événements
        console.error('Erreur lors du chargement des événements :', error);
        throw error;
    }
};