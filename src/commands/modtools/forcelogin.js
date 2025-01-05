const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits} = require('discord.js');
const {login} = require("../../../project_modules/login-manager");
const { users } = require('../../dbObjects.js')

module.exports = {
    cooldown: 0,
    category: 'modtools',
    // Données et  de la commande
    data: new SlashCommandBuilder()
        .setName('forcelogin')
        .setDescription('Permet d\'enregistrer le calendrier moodle/edt de la personne ciblée')
        .addUserOption(option =>
            option.setName('choix-cible')
                .setDescription('Choisissez la personne à qui vous voulez forcer la mise à jour du calendrier')
                .setRequired(true))

        .addIntegerOption(option =>
            option.setName('choix-login')
                .setDescription('Choisissez le type de calendrier à enregistrer')
                .setRequired(true)
                .addChoices(
                    { name: 'moodle', value: 0 },
                    { name: 'edt', value: 1 },
                ))
        .addStringOption(option =>
            option.setName('argument')
                .setDescription('URL du calendrier moodle ou nom d\'utilisateur ent')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setContexts(InteractionContextType.Guild),

    /**
     * Exécute la commande de login pour enregistrer un calendrier Moodle ou EDT.
     * @param {CommandInteraction} interaction - L'interaction de commande provenant de Discord.
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        // Récupérer la cible de l'interaction
        const target = interaction.options.getUser('choix-cible');
        // Récupérer le choix de l'utilisateur (0 pour Moodle, 1 pour EDT)
        const choice = interaction.options.getInteger('choix-login');
        // Récupérer l'argument fourni par l'utilisateur (URL ou identifiant)
        const argument = interaction.options.getString('argument');

        // Différer la réponse pour rendre l'interaction éphémère
        await interaction.deferReply({ ephemeral: true });

        login(choice, argument, interaction, target);
    },
};