// Importation des modules nécessaires
const { ChannelType, SlashCommandBuilder, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
    ComponentType,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const fs = require('node:fs');
const path = require("node:path");
const {getIcsData} = require("../../../project_modules/ics-manager");
const { users } = require('../../dbObjects.js');
const { groups } = require('../../dbObjects.js');
const { groups_users } = require('../../dbObjects.js');
const { licences } = require('../../dbObjects.js');

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
        await interaction.deferReply({ ephemeral: true });
        const user = await users.findOne({ where: { discordid: interaction.user.id } });
        if (!user) {
            await interaction.editReply('Veuillez d\'abord vous connecter avec la commande /login.');
            return;
        }
        if (await groups_users.findOne({ where: { user: interaction.user.id } })) {
            await interaction.editReply('Vous êtes déjà associé à un groupe.');
            return;
        }
        const select = new StringSelectMenuBuilder()
            .setCustomId('selectLicence')
            .addOptions(
                [...new Set((await licences.findAll()).map(licence => licence.name))].map(name =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(name)
                        .setValue(name)
                        .setDescription(`Licence: ${name}`)
                )
            );


        const row = new ActionRowBuilder()
            .addComponents(select);
        const message = await interaction.editReply({
            content: 'Renseignez votre licence',
            components: [row],
        });

        //en haut ça fonctionne

        const selectCollector = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });
        let licenceName;
        let licenceYear;
        selectCollector.on('collect', async i => {
            if (i.customId === 'selectLicence') {
                licenceName = i.values[0];
                const select2 = new StringSelectMenuBuilder()
                    .setCustomId('selectYear')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('L1')
                            .setValue('L1'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('L2')
                            .setValue('L2'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('L3')
                            .setValue('L3'),
                    );
                const row2 = new ActionRowBuilder()
                    .addComponents(select2);
                await i.update({ content: `Licence sélectionnée : ${licenceName}`, components: [row2] });
            }
            if (i.customId === 'selectYear') {
                licenceYear = i.values[0];
                await i.update({ content: `Vous êtes en : ${licenceYear} ${licenceName}`, components: [] });
                await handleYearSelection(interaction, licenceName, licenceYear);
            }
        });
    },
};
async function handleYearSelection(interaction, licenceName, licenceYear) {
    // Votre logique ici
    const user = await users.findOne({ where: { discordid: interaction.user.id } });
    let list_group = await getStudentCourses(`https://apps.univ-lr.fr/cgi-bin/WebObjects/ServeurPlanning.woa/wa/ics?login=${user.lruid}`);
    let newCategory = await createCategory(interaction, licenceYear + " - " + licenceName);
    await licences.update(
        { id: newCategory.id },
        { where: { name: licenceName, year: licenceYear.slice(-1) } }
    );
    await createChannels(interaction, list_group, newCategory);

    await interaction.editReply(`Groupe assigné`);
}
async function createCategory(interaction, categoryName) {
    let category = await findChannelFromName(interaction, categoryName, ChannelType.GuildCategory);
    if (!category) {
        category = await interaction.guild.channels.create({
            name: categoryName,
            type: ChannelType.GuildCategory,
        });

        fs.writeFile(path.resolve(__dirname, '../../../reset.txt'), category.id + ";", { flag: 'a+' }, err => {});

        category.permissionOverwrites.create(category.guild.roles.everyone, { ViewChannel: false });
    }

    category.permissionOverwrites.create(interaction.user, { ViewChannel: true });

    return category;
}

async function createChannels(interaction, listOfChannel, categoryParent) {
    for (let [course, group] of Object.entries(listOfChannel)) {
        let newChannelName = `${group}-${course}`.toLowerCase() // Met en minuscule
            .normalize("NFD") // Décompose les caractères accentués
            .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
            .replace(/[^a-z0-9_]+/g, '-') // Remplace tout ce qui n'est pas alphanumérique ou underscore par un tiret
            .replace(/^-+|-+$/g, '');// Supprime les tirets en début et en fin de chaîne
        let channel = await findChannelFromName(interaction, newChannelName, ChannelType.GuildText, categoryParent);
        if (!channel) {
            channel = await interaction.guild.channels.create({
                name: newChannelName,
                type: ChannelType.GuildText,
                parent: categoryParent.id,
            });

            fs.writeFile(path.resolve(__dirname, '../../../reset.txt'), channel.id+";", { flag: 'a+' }, err => {});

            channel.permissionOverwrites.create(channel.guild.roles.everyone, { ViewChannel: false });
        }

        channel.permissionOverwrites.create(interaction.user, { ViewChannel: true });
        await groups_users.create({ user: interaction.user.id, group: channel.id });
        const existingGroup = await groups.findOne({ where: { id: channel.id } });
        if (!existingGroup) {
            await groups.create({id: channel.id, name: newChannelName});
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
    return null;
    }

async function getStudentCourses(url) {
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