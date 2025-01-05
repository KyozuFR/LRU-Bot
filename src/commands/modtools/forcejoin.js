// Importation des modules nécessaires
const { SlashCommandBuilder, PermissionFlagsBits, InteractionContextType} = require('discord.js');
const {join} = require("../../../project_modules/join-manager");

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 5,
    // Catégorie de la commande
    category: 'modtools',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('forcejoin')
        .setDescription('.')
        .addUserOption(option =>
            option.setName('choix-cible')
                .setDescription('Choisissez la personne à qui vous voulez forcer le join')
             .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setContexts(InteractionContextType.Guild),
    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const target = interaction.options.getUser('choix-cible');
        join(interaction, target);
    },
};