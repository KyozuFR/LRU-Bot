// Importation des modules nécessaires
const { SlashCommandBuilder, PermissionFlagsBits, InteractionContextType} = require('discord.js');
const {leave} = require('../../../project_modules/leave-manager');

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 5,
    // Catégorie de la commande
    category: 'modtools',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('forceleave')
        .setDescription('Quitte le groupe')
        .addUserOption(option =>
            option.setName('choix-cible')
                .setDescription('Choisissez la personne à qui vous voulez forcer la mise à jour du calendrier')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setContexts(InteractionContextType.Guild),

    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */
    async execute(interaction) {
        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: true });
        const target = interaction.options.getUser('choix-cible');
        leave(interaction, target);
    },
};
