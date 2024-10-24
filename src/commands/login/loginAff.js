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
        .setName('loginAff')
        .setDescription('login étudiant afin de scrap EDT')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Nom d\'utilisateur')
                .setRequired(true)),

    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */
    async execute(interaction) {
        let start = Date.now();

        // Récupérer l'option de nom d'utilisateur de l'interaction
        const username = interaction.options.getString('username');


        //lien calendrier université la rochelle
        const url = 'https://srv.lru.brno.fr/ics/' + username;

        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: false });

        let EdtIcsData;
        try {
            EdtIcsData = await getIcsData(url);
        } catch (error) {
            console.error('Error fetching EDT data:', error);
            return interaction.editReply({ content: 'Impossible de récuperer votre EDT.' });
        }

        let EdtJsonData = getJsonDataFromIcs(EdtIcsData,5);

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
                .setTitle(`Voici vos prochain cours ${interaction.user.displayName} ;)`)
                .setDescription(`Page ${curPage}/${Object.keys(EdtJsonData).length}`)
                .addFields(getFields(EdtJsonData, curPage))
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
                curPage = Math.min(curPage + 1, Object.keys(EdtJsonData).length);
            }

            await i.update({ embeds: [new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(`Voici vos prochain cours ${interaction.user.displayName} ;)`)
                    .setDescription(`Page ${curPage}/${Object.keys(EdtJsonData).length}`)
                    .addFields(getFields(EdtJsonData, curPage))
                    .setTimestamp()
                    .setFooter({ text: `Requête réalisé en ${Date.now() - start}ms`, iconURL: 'https://images-ext-1.discordapp.net/external/kMhIi1qtRXShjyfpUaFtpeANp0CUby-IxgrbxN6JUhw/https/www.univ-larochelle.fr/wp-content/uploads/png/logo-universite-de-la-rochelle-2X.png' })
                ],
            });
        });
    },
};

/**
 * Crée les champs pour l'embed Discord à partir des données de l'EDT.
 * @param {Object} jsonData - Les données de l'edt.
 * @param {number} page - La page actuelle des données.
 * @returns {Array<Object>} - Les champs pour l'embed Discord.
 */
function getFields(jsonData, page) {
    let fields = [];

    for (const [event] in jsonData[page]) {
        fields.push({
            name: String(jsonData[page][event].start),
            value: `${jsonData[page][event].summary}`,
            inline: false
        });
    }
    return fields;
}