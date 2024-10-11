// Importation des modules nécessaires
const {  SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const ical = require('ical')

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 0,
    // Catégorie de la commande
    category: 'login',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('login-moodle')
        .setDescription('Met en relation avec le calendrier de Moodle.'),
    // Logique d'exécution de la commande
    async execute(interaction) {
        // Différer la réponse à l'interaction
        await interaction.deferReply({  });

        await interaction.editReply({
            content: `Récupération des données en cours...`,
        });

        let moodleData = [];

        const url = process.env.MOODLE_CALENDAR;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            moodleData = ical.parseICS(await response.text());
        } catch (error) {
            console.error(error.message);
        }

        const upcomingEvents = Object.values(moodleData)
            .filter(event => event.start > Date.now() && event.start < Date.now()+2*24*60*60*1000)
            .sort((a, b) => a.start - b.start)

        await interaction.editReply({
            content: `Activités les plus proches:\n${upcomingEvents.map(event => `- **${event["summary"]}** : ${new Date(event["end"]).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })} (${event["categories"]})`).join('\n')}`,
        });
    },
};