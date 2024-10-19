const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require('discord.js');
const ical = require('ical');

const { lruBot } = require('../../dbObjects.js')

module.exports = {
    cooldown: 0,
    category: 'login',
    data: new SlashCommandBuilder()
        .setName('login-moodle')
        .setDescription('affiche le calendrier de Moodle.')
        .addStringOption(option =>
            option.setName('url')
                .setDescription("URL de votre calendrier Moodle")),
    async execute(interaction) {
        let start = Date.now();
        const url = interaction.options.getString('url') ?? process.env.MOODLE_CALENDAR;

        await interaction.deferReply({ ephemeral: true });

        let moodleData;
        try {
            moodleData = await getRawData(url);
        } catch (error) {
            console.error('Error fetching Moodle data:', error);
            return interaction.editReply({ content: 'Impossible de récuperer votre agenda Moodle.' });
        }

        let moodleDataUseable = getUseableData(moodleData);

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
        let message = await interaction.editReply({
            embeds: [getEmbed(interaction.user.displayName, moodleDataUseable, curPage, start)],
            components: [row]
        });

        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 }); // attention : time ne se reset pas à chaque interaction

        collector.on('collect', async i => {
            start = Date.now();
            if (i.customId === 'previous') {
                curPage = Math.max(curPage - 1, 0);
            } else if (i.customId === 'next') {
                curPage = Math.min(curPage + 1, Object.keys(moodleDataUseable).length - 1);
            }

            await i.update({ embeds: [getEmbed(interaction.user.displayName, moodleDataUseable, curPage, start)] });
        });
    },
};

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

function getEmbed(displayName, data, page, start) {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Voici vos activité Moodle ${displayName} ;)`)
        .setDescription(`Page ${page + 1}/${Object.keys(data).length}`)
        .addFields(getFields(data, page))
        .setTimestamp()
        .setFooter({ text: `Requête réalisé en ${Date.now() - start}ms`, iconURL: 'https://images-ext-1.discordapp.net/external/kMhIi1qtRXShjyfpUaFtpeANp0CUby-IxgrbxN6JUhw/https/www.univ-larochelle.fr/wp-content/uploads/png/logo-universite-de-la-rochelle-2X.png' });
}

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