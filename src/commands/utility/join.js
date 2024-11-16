// Importation des modules nécessaires
const { ChannelType, SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require("node:path");
const { getJsonDataFromIcs, getIcsData} = require("../../../project_modules/ics-manager");
const { users } = require('../../dbObjects.js');

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
        const user = await users.findOne({ where: { discordid: interaction.user.id } });
        if (!user) {
            await interaction.editReply('Veuillez d\'abord vous connecter avec la commande /login.');
            return;
        }
        let liste_groupe = await getGroupeEtudiant(`https://apps.univ-lr.fr/cgi-bin/WebObjects/ServeurPlanning.woa/wa/ics?login=${user.lruid}`);
        await createChannels(interaction, liste_groupe, newCategory);

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

async function getGroupeEtudiant(url) {
    let calendarData;
    try {
        calendarData = await getIcsData(url);
    } catch (error) {
        console.error(`Error fetching ${choice === 0 ? 'Moodle' : 'EDT'} data:`, error);
        await interaction.editReply(`Impossible de récuperer votre EDT'}.`);
        return;
    }
    let tabcours = {};
    for (const event in calendarData) {
        //Je prend la saumaire de l'évenement et le sépare par catégorie
        let tmp = calendarData[event].summary.split(';');
        //j'enlève la première partie qui ne m'intéresse pas
        let tmpsplited = tmp.slice(1,tmp.length);
        tmp = tmpsplited.join(';');
        const regex = /\b(TD|TP|TEA)(_\w+\d?[a-zA-Z]?)?\b/g;
        const matches = [];
        let match;

        // Trouver toutes les occurrences du motif dans la chaîne
        while ((match = regex.exec(tmp)) !== null) {
            matches.push(match[0]);  // Ajouter la correspondance trouvée dans le tableau
        }
        //si il n'y a qu'une occurences et donc une seul groupe la valeur est ajouté au dictionaire
        if (matches.length === 1) {
            for (const findtd in tmpsplited){
                if (tmpsplited[findtd].includes(matches[0])){
                    //console.log(tmp[findtd]);
                    tabcours[tmpsplited[findtd].split('[')[0]] = matches[0];
                }
            }
            // La valeur de match[0] est l'occurrence trouvée
        }
    }
    return tabcours;
}