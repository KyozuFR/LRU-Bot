// Importation des modules nécessaires
const {SlashCommandBuilder} = require('discord.js');
const {join} = require("../../../project_modules/join-manager");

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 5,
    // Catégorie de la commande
    category: 'utility',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Permet de rejoindre un groupe.'),

    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        join(interaction, interaction.user);
    },
};