// Importation des modules nécessaires
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require('discord.js');
const ical = require('ical');
const { lruBot } = require('../../dbObjects.js');

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 0,
    // Catégorie de la commande
    category: 'login',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('login-moodle')
        .setDescription('affiche le calendrier de Moodle.')
        .addStringOption(option =>
            option.setName('url')
                .setDescription("URL de votre calendrier Moodle")),

    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */
    async execute(interaction) {
        let start = Date.now();
        // Récupérer l'URL du calendrier Moodle depuis les options de l'interaction ou les variables d'environnement
        const url = interaction.options.getString('url') ?? process.env.MOODLE_CALENDAR;

        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: true });

        let moodleData;
        try {
            // Récupérer les données brutes du calendrier Moodle
            moodleData = await getRawData(url);
        } catch (error) {
            console.error('Error fetching Moodle data:', error);
            return interaction.editReply({ content: 'Impossible de récuperer votre agenda Moodle.' });
        }

        // Transformer les données brutes en données utilisables
        let moodleDataUseable = getUseableData(moodleData);

        // Créer les boutons de navigation
        const previous = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('◀️')
            .setStyle(ButtonStyle.Primary);

        const next = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('▶️')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(previous, next);

        let curPage = 0;
        // Envoyer la réponse initiale avec les données du calendrier et les boutons de navigation
        let message = await interaction.editReply({
            embeds: [getEmbed(interaction.user.displayName, moodleDataUseable, curPage, start)],
            components: [row]
        });

        // Créer un collecteur pour gérer les interactions avec les boutons
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });

        collector.on('collect', async i => {
            start = Date.now();
            // Gérer les interactions avec les boutons de navigation
            if (i.customId === 'previous') {
                curPage = Math.max(curPage - 1, 0);
            } else if (i.customId === 'next') {
                curPage = Math.min(curPage + 1, Object.keys(moodleDataUseable).length - 1);
            }

            // Mettre à jour l'embed avec la nouvelle page de données
            await i.update({ embeds: [getEmbed(interaction.user.displayName, moodleDataUseable, curPage, start)] });
        });
    },
};

/**
 * Récupère les données brutes du calendrier Moodle depuis l'URL fournie.
 * @param {string} url - L'URL du calendrier Moodle.
 * @returns {Promise<Object>} - Les données brutes du calendrier.
 * @throws {Error} - Si une erreur se produit lors de la récupération des données.
 */
async function getRawData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return ical.parseICS(await response.text());
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

/**
 * Transforme les données brutes en données utilisables pour l'affichage.
 * @param {Object} data - Les données brutes du calendrier.
 * @param {number} nb_date_page - Le nombre de dates par page.
 * @returns {Object} - Les données transformées et paginées.
 */
function getUseableData(data, nb_date_page = 5) {
    let useable_data = {};
    let cur_page = 0;

    for (const [key, value] of Object.entries(data)) {
        if (!useable_data[cur_page]) {
            useable_data[cur_page] = {};
        }

        let useable_data_date = value["end"].toISOString().split('T')[0];
        if (useable_data_date >= new Date().toISOString().split('T')[0]) {
            if (useable_data[cur_page][useable_data_date]) {
                useable_data[cur_page][useable_data_date].push({
                    end: value['end'],
                    summary: value['summary'],
                    categories: value['categories']
                });
            } else {
                useable_data[cur_page][useable_data_date] = [{
                    end: value['end'],
                    summary: value['summary'],
                    categories: value['categories']
                }];
            }
        }

        if (Object.keys(useable_data[cur_page]).length >= nb_date_page) {
            cur_page++;
        }
    }
    return useable_data;
}

/**
 * Crée un embed Discord pour afficher les données du calendrier Moodle.
 * @param {string} displayName - Le nom d'affichage de l'utilisateur.
 * @param {Object} data - Les données du calendrier Moodle.
 * @param {number} page - La page actuelle des données.
 * @param {number} start - Le timestamp de début de la requête.
 * @returns {EmbedBuilder} - L'embed Discord.
 */
function getEmbed(displayName, data, page, start) {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Voici vos activité Moodle ${displayName} ;)`)
        .setDescription(`Page ${page + 1}/${Object.keys(data).length}`)
        .addFields(getFields(data, page))
        .setTimestamp()
        .setFooter({ text: `Requête réalisé en ${Date.now() - start}ms`, iconURL: 'https://images-ext-1.discordapp.net/external/kMhIi1qtRXShjyfpUaFtpeANp0CUby-IxgrbxN6JUhw/https/www.univ-larochelle.fr/wp-content/uploads/png/logo-universite-de-la-rochelle-2X.png' });
}

/**
 * Crée les champs pour l'embed Discord à partir des données du calendrier Moodle.
 * @param {Object} data - Les données du calendrier Moodle.
 * @param {number} page - La page actuelle des données.
 * @returns {Array<Object>} - Les champs pour l'embed Discord.
 */
function getFields(data, page) {
    let fields = [];
    for (const [key, events] of Object.entries(data[page])) {
        let field = { name: key, value: "", inline: false };
        for (const event of events) {
            field.value += `**${event.categories}** : ${event.summary}\n`;
        }

        fields.push(field);
    }
    return fields;
}