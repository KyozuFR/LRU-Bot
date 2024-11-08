// Importation des modules nécessaires
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 1,
    // Catégorie de la commande
    category: 'utility',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription(`Renvoie les commande existantes et l'aide de la commande en argument`)
        .addIntegerOption(option =>
        option.setName('choix-commande')
            .setDescription('Choisissez la commande pour laquelle vous souhaitez obtenir de l\'aide')
            .addChoices(
                { commande: 'login', value: 0 },
                { commande: 'display', value: 1 },
                { commande: 'join', value: 2 },
                { commande: 'ping', value: 3 },
            )),
    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */
    async execute(interaction) {
        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: true });

        

    },
};