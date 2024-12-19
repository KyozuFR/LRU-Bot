// Importation des modules nécessaires
const { SlashCommandBuilder} = require('discord.js');
const {leave} = require('../../../project_modules/leave-manager');

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 5,
    // Catégorie de la commande
    category: 'utility',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Quitte le groupe'),

    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */
    async execute(interaction) {
        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: true });
        leave(interaction, interaction.user);
    },
};

