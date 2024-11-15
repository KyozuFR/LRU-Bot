// Importation des modules nécessaires
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 5,
    // Catégorie de la commande
    category: 'utility',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('destroy')
        .setDescription('.'),

    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */
    async execute(interaction) {
        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: true });

        // recupère la liste des salons à destroy
        const content = fs.readFileSync(path.resolve(__dirname, '../../../reset.txt'), 'utf8').split(";").slice(0, -1);

        for (elmt in content) {
            const channel = interaction.guild.channels.cache.get(content[elmt]);
            if (channel) {
                channel.delete();
            }
        }
        fs.writeFile(path.resolve(__dirname, '../../../reset.txt'), "", err => {});

        await interaction.editReply(`Groupe supprimé`);
    },
};