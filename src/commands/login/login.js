// Importation des modules nécessaires
const { SlashCommandBuilder } = require('discord.js');
const {login} = require("../../../project_modules/login-manager");

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 0,
    // Catégorie de la commande
    category: 'login',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Permet d\'enregistrer ton calendrier moodle/edt')
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
                .setDescription('URL de votre calendrier moodle ou nom d\'utilisateur ent')
                .setRequired(true)),

    /**
     * Exécute la commande de login pour enregistrer un calendrier Moodle ou EDT.
     * @param {Interaction} interaction - L'interaction de commande provenant de Discord.
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        // Récupérer le choix de l'utilisateur (0 pour Moodle, 1 pour EDT)
        const choice = interaction.options.getInteger('choix-login');
        // Récupérer l'argument fourni par l'utilisateur (URL ou identifiant)
        const argument = interaction.options.getString('argument');

        // Différer la réponse pour rendre l'interaction éphémère
        await interaction.deferReply({ ephemeral: true });
        login(choice, argument, interaction, interaction.user);
    },
};