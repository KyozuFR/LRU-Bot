const {users, groups_users, licences, groups} = require("../src/dbObjects");
const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, ChannelType} = require("discord.js");
const {getIcsData} = require("./ics-manager");

/**
 * Fonction pour assigner un utilisateur à un groupe
 * @param {Interaction.user} userused - le user qui va être login.
 * @param {Interaction} interaction - Gestion intéraction avec discord.
 * @throws {Error} - Si la récupération ou le parsing des données échoue.
 */
async function join(interaction, userused) {

    // Vérification de connexion
    const user = await users.findOne({ where: { discordid: userused.id } });
    if (!user) {
        await interaction.editReply('Veuillez d\'abord vous connecter avec la commande /login en selectionant edt.');
        return;
    }
    if (!user.lruid) {
        await interaction.editReply('Veuillez d\'abord vous connecter avec la commande /login en selectionant edt.');
        return;
    }
    if (await groups_users.findOne({ where: { user: userused.id } })) {
        await interaction.editReply('Vous êtes déjà associé à un groupe.');
        return;
    }

    //Création du premier menu
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


    //affichage du premier menu
    const row = new ActionRowBuilder()
        .addComponents(select);
    const message = await interaction.editReply({
        content: 'Renseignez votre licence',
        components: [row],
    });


    //Attente de la selection de la licence
    const selectCollector = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });
    let licenceName;
    let licenceYear;
    selectCollector.on('collect', async i => {
        //Le collecteur écoute les réponses de l'utilisateur et les traite selon l'id du menu
        if (i.customId === 'selectLicence') {
            licenceName = i.values[0];
            //Création du deuxième menu
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

            //affichage du deuxième menu
            const row2 = new ActionRowBuilder()
                .addComponents(select2);
            await i.update({ content: `Licence sélectionnée : ${licenceName}`, components: [row2] });
        }
        if (i.customId === 'selectYear') {
            licenceYear = i.values[0];
            await i.update({ content: `Vous êtes en : ${licenceYear} ${licenceName}`, components: [] });
            //Traitement des données saisi par l'utilisateur
            await handleYearSelection(interaction, licenceName, licenceYear, userused);
        }
    });
}

/**
 * Fonction réalisé après la selection de la licence et de l'année afin d'assigner l'utilisateur à un groupe
 * @param {Interaction} interaction - Gestion intéraction avec discord.
 * @param {string} licenceName - le nom de la licence.
 * @param {string} licenceYear - l'année de la licence.
 * @param {Interaction.user} userused - le user qui va être login.
 * @throws {Error} - Si la récupération ou le parsing des données échoue.
 */
async function handleYearSelection(interaction, licenceName, licenceYear, userused) {
    //Récupération des données nécessaires
    const user = await users.findOne({ where: { discordid: userused.id } });
    let list_group = await getStudentCourses(`https://apps.univ-lr.fr/cgi-bin/WebObjects/ServeurPlanning.woa/wa/ics?login=${user.lruid}`);

    //Création de la catégorie et des channels si il n'éxiste pas
    let newCategory = await createCategory(interaction, licenceYear + " - " + licenceName, userused);
    createChannel(interaction,'General', newCategory, userused);
    await licences.update(
        { id: newCategory.id },
        { where: { name: licenceName, year: licenceYear.slice(-1) } }
    );
    await createChannels(interaction, list_group, newCategory, userused);

    await interaction.editReply(`Groupe assigné`);
}

/**
 * Fonction de création de catégorie si elle n'existe pas
 * @param {Interaction} interaction - Gestion intéraction avec discord.
 * @param {string} categoryName - le nom de la catégorie.
 * @param {Interaction.user} userused - le user qui va être login.
 */
async function createCategory(interaction, categoryName, userused) {
    let category = await findChannelFromName(interaction, categoryName, ChannelType.GuildCategory);
    if (!category) {
        category = await interaction.guild.channels.create({
            name: categoryName,
            type: ChannelType.GuildCategory,
        });



        category.permissionOverwrites.create(category.guild.roles.everyone, { ViewChannel: false });
    }

    category.permissionOverwrites.create(userused, { ViewChannel: true });

    await users.update({ licenceid: category.id }, { where: { discordid: userused.id } });
    return category;
}


/**
 * Fonction de création de channels si ils n'existent pas
 * @param {Interaction} interaction - Gestion intéraction avec discord.
 * @param {Object} listOfChannel - liste des channels à créer.
 * @param {Channel} categoryParent - la catégorie parente.
 * @param {Interaction.user} userused - le user qui va être login.
 * @throws {Error} - Si la récupération ou le parsing des données échoue.
 */
async function createChannels(interaction, listOfChannel, categoryParent, userused) {
    for (let [course, group] of Object.entries(listOfChannel)) {
        let newChannelName = `${group}-${course}`.toLowerCase() // Met en minuscule
            .normalize("NFD") // Décompose les caractères accentués
            .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
            .replace(/[^a-z0-9_]+/g, '-') // Remplace tout ce qui n'est pas alphanumérique ou underscore par un tiret
            .replace(/^-+|-+$/g, '');// Supprime les tirets en début et en fin de chaîne
        //mis dans une fonction async pour que tous les channels se crée en même temps
        createChannel(interaction, newChannelName, categoryParent, userused);
    }
}


/**
 * Fonction pour trouver un channel par son nom
 * @param {Interaction} interaction - Gestion intéraction avec discord.
 * @param {string} name - le nom du channel.
 * @param {ChannelType} objectType - le type de channel.
 * @param {Channel} categoryParent - la catégorie parente.
 * @throws {Error} - Si la récupération ou le parsing des données échoue.
 */
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


/**
 * Fonction pour récupérer les cours de l'étudiant
 * @param {string} url - le lien de l'EDT.
 * @throws {Error} - Si la récupération ou le parsing des données échoue.
 */
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

/**
 * Fonction créant un channel si il n'existe pas
 * @param {Interaction} interaction - Gestion intéraction avec discord.
 * @param {string} newChannelName - le nom du channel.
 * @param {Channel} categoryParent - la catégorie parente.
 * @param {Interaction.user} userused - le user qui va être login.
 * @throws {Error} - Si la récupération ou le parsing des données échoue.
 */
async function createChannel(interaction, newChannelName, categoryParent, userused) {
    let channel = await findChannelFromName(interaction, newChannelName, ChannelType.GuildText, categoryParent);
    if (!channel) {
        channel = await interaction.guild.channels.create({
            name: newChannelName,
            type: ChannelType.GuildText,
            parent: categoryParent.id,
        });



        channel.permissionOverwrites.create(channel.guild.roles.everyone, { ViewChannel: false });
    }

    channel.permissionOverwrites.create(userused, { ViewChannel: true });
    await groups_users.create({ user: userused.id, group: channel.id });
    const existingGroup = await groups.findOne({ where: { id: channel.id } });
    if (!existingGroup) {
        await groups.create({id: channel.id, name: newChannelName});
    }
}

module.exports = {
    join
};

