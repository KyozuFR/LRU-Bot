// Importation des modules nécessaires
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 5,
    // Catégorie de la commande
    category: 'login',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('login étudiant afin de scrap EDT')
        .addStringOption(option => option.setName('username').setDescription('Nom d\'utilisateur').setRequired(true)),
    // Logique d'exécution de la commande
    async execute(interaction) {
        const start = Date.now();

        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: false });

        // Récupérer l'option de nom d'utilisateur de l'interaction
        const username = interaction.options.getString('username');


        // Modifier la réponse avec le temps de réponse et les boutons
        await interaction.editReply({
            content: `Username de: ${interaction.user}  = ${username}| Requete réalisé en: ${Date.now() - start}ms`,
        });

        // Optionnellement attendre et supprimer la réponse
        //await wait(10_000);
        //interaction.deleteReply();
    },
};