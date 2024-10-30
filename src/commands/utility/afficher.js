const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ComponentType} = require('discord.js');
const ical = require('ical');

const { lruBot } = require('../../dbObjects.js')
const {getIcsData, getJsonDataFromIcs} = require("../../../project_modules/ics-manager");

module.exports = {
    cooldown: 0,
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('afficher')
        .setDescription('Permet d\'afficher ton calendrier moodle/edt')
        .addIntegerOption(option =>
            option.setName('choix-login')
                .setDescription('Choisissez le type de calendrier à afficher')
                .setRequired(true)
                .addChoices(
                    { name: 'moodle', value: 0 },
                    { name: 'edt', value: 1 },
                )),

    async execute(interaction) {
        let start = Date.now();
        const choice = interaction.options.getInteger('choix-login');

        await interaction.deferReply({ ephemeral: true });
        if ((await lruBot.findAll({ where: { discordid: interaction.user.id } })).length === 0) {
            await interaction.editReply('Veuillez d\'abord vous connecter avec la commande /login.');
            return null;
        }
        const user = await lruBot.findOne({ where: { discordid: interaction.user.id } });

        switch (choice) {
            case 0:
                try {
                    let moodleIcsData;
                    try {
                        moodleIcsData = await getIcsData(user.moodlelink);
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
                            .addFields(getFieldsMoodle(moodleJsonData, curPage))
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
                                .addFields(getFieldsMoodle(moodleJsonData, curPage))
                                .setTimestamp()
                                .setFooter({ text: `Requête réalisé en ${Date.now() - start}ms`, iconURL: 'https://images-ext-1.discordapp.net/external/kMhIi1qtRXShjyfpUaFtpeANp0CUby-IxgrbxN6JUhw/https/www.univ-larochelle.fr/wp-content/uploads/png/logo-universite-de-la-rochelle-2X.png' })
                            ],
                        });
                    });
                }
                catch (error) {
                    await interaction.editReply('URL moodle non valide.');
                }
                break;
            case 1:
                const url = 'https://srv.lru.brno.fr/ics/' + user.lruid;
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
                        .addFields(getFieldEDT(EdtJsonData, curPage))
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
                            .addFields(getFieldEDT(EdtJsonData, curPage))
                            .setTimestamp()
                            .setFooter({ text: `Requête réalisé en ${Date.now() - start}ms`, iconURL: 'https://images-ext-1.discordapp.net/external/kMhIi1qtRXShjyfpUaFtpeANp0CUby-IxgrbxN6JUhw/https/www.univ-larochelle.fr/wp-content/uploads/png/logo-universite-de-la-rochelle-2X.png' })
                        ],
                    });
                });
                break;
        }
    },
};

function getFieldsMoodle(jsonData, page) {
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

function getFieldEDT(jsonData, page) {
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