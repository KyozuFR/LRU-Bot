// Importation des modules nécessaires
const { SlashCommandBuilder } = require('discord.js');

const { users, reminders } = require('../../dbObjects.js');

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 5,
    // Catégorie de la commande
    category: 'utility',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setDescription('Ajoute/Supprime un rappel pour l\'utilisateur')
        .addIntegerOption(option =>
            option.setName('action')
                .setDescription('Action à effectuer')
                .setRequired(true)
                .addChoices(
                    { name: 'add', value: 0 },
                    { name: 'remove', value: 1 },
                ))
        .addStringOption(option =>
            option.setName('cours')
                .setDescription('Nom du cours')
                .setRequired(true)),

    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */
    async execute(interaction) {
        const start = Date.now();
        const choice = interaction.options.getInteger('action');
        const cours = interaction.options.getString('cours');

        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: true });

        switch (choice){
            case 0:
                //const moodlelink = users.findOne({ where: { discordid: interaction.user.id } }).moodlelink;
                console.log(moodlelink);
                break;
            case 1:

                break;
        }

        await interaction.editReply(`Commande exécutée en ${Date.now() - start}ms.`);
    },
};