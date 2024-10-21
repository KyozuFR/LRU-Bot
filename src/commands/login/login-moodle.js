// Importation des modules nécessaires
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require('discord.js');

const { getIcsData, getJsonDataFromIcs } = require('../../../project_modules/ics-manager.js');

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

        let moodleIcsData;
        try {
            moodleIcsData = await getIcsData(url);
        } catch (error) {
            console.error('Error fetching Moodle data:', error);
            return interaction.editReply({ content: 'Impossible de récuperer votre agenda Moodle.' });
        }

        let moodleJsonData = getJsonDataFromIcs(moodleIcsData,5);

        const previous = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('◀️')
            .setStyle(ButtonStyle.Primary);

        const next = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('▶️')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(previous, next);

        let curPage = 1;

        let message = await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`Voici vos activité Moodle ${interaction.user.displayName} ;)`)
                .setDescription(`Page ${curPage}/${Object.keys(moodleJsonData).length}`)
                .addFields(getFields(moodleJsonData, curPage))
                .setTimestamp()
                .setFooter({ text: `Requête réalisé en ${Date.now() - start}ms`, iconURL: 'https://images-ext-1.discordapp.net/external/kMhIi1qtRXShjyfpUaFtpeANp0CUby-IxgrbxN6JUhw/https/www.univ-larochelle.fr/wp-content/uploads/png/logo-universite-de-la-rochelle-2X.png' })
            ],
            components: [row]
        });

        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 }); // attention : time ne se reset pas à chaque interaction

        collector.on('collect', async i => {
            start = Date.now();
            if (i.customId === 'previous') {
                curPage = Math.max(curPage - 1, 1);
            } else if (i.customId === 'next') {
                curPage = Math.min(curPage + 1, Object.keys(moodleJsonData).length);
            }

            await i.update({ embeds: [new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(`Voici vos activité Moodle ${interaction.user.displayName} ;)`)
                    .setDescription(`Page ${curPage}/${Object.keys(moodleJsonData).length}`)
                    .addFields(getFields(moodleJsonData, curPage))
                    .setTimestamp()
                    .setFooter({ text: `Requête réalisé en ${Date.now() - start}ms`, iconURL: 'https://images-ext-1.discordapp.net/external/kMhIi1qtRXShjyfpUaFtpeANp0CUby-IxgrbxN6JUhw/https/www.univ-larochelle.fr/wp-content/uploads/png/logo-universite-de-la-rochelle-2X.png' })
                ],
            });
        });
    },
};

/**
 * Crée les champs pour l'embed Discord à partir des données du calendrier Moodle.
 * @param {Object} jsonData - Les données du calendrier Moodle.
 * @param {number} page - La page actuelle des données.
 * @returns {Array<Object>} - Les champs pour l'embed Discord.
 */
function getFields(jsonData, page) {
    let fields = [];

    for (const [event] in jsonData[page]) {
        fields.push({
            name: String(jsonData[page][event].end),
            value: `**${jsonData[page][event].categories}** : ${jsonData[page][event].summary}`,
            inline: false
        });
    }
    return fields;
}