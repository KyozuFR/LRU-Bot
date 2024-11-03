const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ComponentType } = require('discord.js');
const { lruBot } = require('../../dbObjects.js');
const { getIcsData, getJsonDataFromIcs } = require("../../../project_modules/ics-manager");

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
        const start = Date.now();
        const choice = interaction.options.getInteger('choix-login');

        await interaction.deferReply({ ephemeral: true });

        // Vérifie si l'utilisateur est connecté
        const user = await lruBot.findOne({ where: { discordid: interaction.user.id } });
        if (!user) {
            await interaction.editReply('Veuillez d\'abord vous connecter avec la commande /login.');
            return;
        }

        // Détermine l'URL du calendrier selon le choix
        const url = choice === 0 ? user.moodlelink : `https://srv.lru.brno.fr/ics/${user.lruid}`;
        const title = choice === 0 ? `Voici vos activité Moodle ${interaction.user.displayName} ;)` : `Voici vos prochain cours ${interaction.user.displayName} ;)`;
        const getFieldFunction = choice === 0 ? getFieldsMoodle : getFieldsEDT;

        // Récupère et convertit les données ICS
        let calendarData;
        try {
            const icsData = await getIcsData(url);
            calendarData = getJsonDataFromIcs(icsData, 5);
        } catch (error) {
            console.error(`Error fetching ${choice === 0 ? 'Moodle' : 'EDT'} data:`, error);
            await interaction.editReply(`Impossible de récuperer votre ${choice === 0 ? 'agenda Moodle' : 'EDT'}.`);
            return;
        }

        // Crée les boutons de pagination
        const previous = new ButtonBuilder().setCustomId('previous').setLabel('◀️').setStyle(ButtonStyle.Primary);
        const next = new ButtonBuilder().setCustomId('next').setLabel('▶️').setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder().addComponents(previous, next);

        let curPage = 1;

        // Affiche la première page du calendrier
        const message = await interaction.editReply({
            embeds: [createEmbed(title, calendarData, getFieldFunction, curPage, start)],
            components: [row]
        });

        // Gestion des interactions des boutons de pagination
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });

        collector.on('collect', async i => {
            const start = Date.now();
            curPage = i.customId === 'previous' ? Math.max(curPage - 1, 1) : Math.min(curPage + 1, Object.keys(calendarData).length);
            await i.update({ embeds: [createEmbed(title, calendarData, getFieldFunction, curPage, start)] });
        });
    },
};

// Fonction pour créer un embed
function createEmbed(title, jsonData, getFieldFunction, page, start) {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(title)
        .setDescription(`Page ${page}/${Object.keys(jsonData).length}`)
        .addFields(getFieldFunction(jsonData, page))
        .setTimestamp()
        .setFooter({ text: `Requête réalisé en ${Date.now() - start}ms`, iconURL: 'https://images-ext-1.discordapp.net/external/kMhIi1qtRXShjyfpUaFtpeANp0CUby-IxgrbxN6JUhw/https/www.univ-larochelle.fr/wp-content/uploads/png/logo-universite-de-la-rochelle-2X.png' });
}

// Fonction pour formater les données Moodle
function getFieldsMoodle(jsonData, page) {
    return jsonData[page].map(event => ({
        name: String(event.end),
        value: `**${event.categories}** : ${event.summary}`,
        inline: false
    }));
}

// Fonction pour formater les données EDT
function getFieldsEDT(jsonData, page) {
    return jsonData[page].map(event => ({
        name: String(event.start),
        value: `${event.summary}`,
        inline: false
    }));
}
