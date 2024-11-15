// Importation des modules nécessaires
const { ChannelType, SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require("node:path");

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 5,
    // Catégorie de la commande
    category: 'utility',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('.'),

    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */
    async execute(interaction) {
        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: true });

        await createChannel({
            "test1":"tp1",
            "test2":"tp1",
            "test3":"tp2",
        });

        await interaction.editReply(`bibipboop`);

        async function createChannel(listofchannel) {
            for (elmt in listofchannel) {
                let new_chanel = await interaction.guild.channels.create({
                    name: listofchannel[elmt]+" - "+elmt,
                    type: ChannelType.GuildText,
                    parent: interaction.guild,
                });

                fs.writeFile(path.resolve(__dirname, '../../../reset.txt'), new_chanel.id+";", { flag: 'a+' }, err => {});
            }
        }
    },
};