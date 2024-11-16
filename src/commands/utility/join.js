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
        const licenceName = interaction.options.getString('nom-licence');
        const licenceYears = interaction.options.getInteger('annee');

        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: true });

        let newCategory = await createCategory(interaction, "L"+licenceYears+" - "+licenceName)

        let liste_temporaire = {"cours1":"tp1", "cours2":"tp1",  "cours3":"tp2"};
        await createChannels(interaction, liste_temporaire, newCategory);

        await interaction.editReply(`Groupe assigné`);
    },
};

async function createCategory(interaction, categoryName) {
    let existingCategory = await findChannelFromName(interaction, categoryName, ChannelType.GuildCategory);
    if (existingCategory) {
        return existingCategory;
    }

    let newCategory = await interaction.guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory,
    });

    fs.writeFile(path.resolve(__dirname, '../../../reset.txt'), newCategory.id + ";", { flag: 'a+' }, err => {});

    return newCategory;
}

async function createChannels(interaction, listOfChannel, categoryParent) {
    for (let [course, group] of Object.entries(listOfChannel)) {
        let existingChannel = await findChannelFromName(interaction, group + "-" + course, ChannelType.GuildText, categoryParent);
        if (!existingChannel) {
            let newChannel = await interaction.guild.channels.create({
                name: group + "-" + course,
                type: ChannelType.GuildText,
                parent: categoryParent.id,
            });

            fs.writeFile(path.resolve(__dirname, '../../../reset.txt'), newChannel.id+";", { flag: 'a+' }, err => {});
        }
    }
}

async function findChannelFromName(interaction, name, objectType, categoryParent = interaction.guild) { // à revoir plus tard
    let guildChannels = interaction.guild.channels.cache;
    for (let [id, channel] of guildChannels) {
        if (channel.type === objectType && channel.name.toLowerCase() === name.toLowerCase()) {
            if (objectType === ChannelType.GuildCategory) { // ceci gère les catégories
                return channel;
            } else if (objectType === ChannelType.GuildText && categoryParent.id === channel.parentId) { // ceci ce qui peut être dans des catégories (pour le moment que des salon text)
                return channel;
            }
        }
    }
    return false;
}