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
        .setDescription('.')
        .addStringOption(option =>
            option.setName('nom-licence')
                .setDescription('Le nom de votre licence')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('annee')
                .setDescription('Votre année universitaire')
                .setRequired(true)),

    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */
    async execute(interaction) {
        const licence_name = interaction.options.getString('nom-licence');
        const licence_years = interaction.options.getInteger('annee');

        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: true });

        let new_category = await interaction.guild.channels.create({
            name: "L"+licence_years+" - "+licence_name,
            type: ChannelType.GuildCategory,
            parent: interaction.guild,
        });
        fs.writeFile(path.resolve(__dirname, '../../../reset.txt'), new_category.id+";", { flag: 'a+' }, err => {});

        await createChannel({
            "cours1":"tp1",
            "cours2":"tp1",
            "cours3":"tp2",
        });

        await interaction.editReply(`Groupe assigné`);

        async function createChannel(listofchannel) {
            for (elmt in listofchannel) {
                let new_chanel = await interaction.guild.channels.create({
                    name: listofchannel[elmt]+" - "+elmt,
                    type: ChannelType.GuildText,
                    parent: new_category,
                });
                fs.writeFile(path.resolve(__dirname, '../../../reset.txt'), new_chanel.id+";", { flag: 'a+' }, err => {});
            }
        }
    },
};