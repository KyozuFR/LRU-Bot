// Importation des modules nécessaires
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder  } = require('discord.js');
const ical = require('ical');

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 5,
    // Catégorie de la commande
    category: 'login',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('login étudiant afin de scrap EDT')
        .addStringOption(option => option.setName('username').setDescription('Nom d\'utilisateur').setRequired(true)),
    // Logique d'exécution de la commande
    async execute(interaction) {
        const start = Date.now();

        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: false });

        // Récupérer l'option de nom d'utilisateur de l'interaction
        const username = interaction.options.getString('username');


        //lien calendrier université la rochelle
        const url = 'https://srv.lru.brno.fr/ics/' + username;

        const Embed = new EmbedBuilder()
            .setTitle(`${interaction.user.tag}`)
            .setDescription(`${username} | Requete réalisé en: ${Date.now() - start}ms \n Cours:`)
            .setColor(0x0099FF)
            .setURL(`${url}`)
            .setTimestamp()
            .setFooter({ text: `Requete réalisé en: ${Date.now() - start}ms`, iconURL: 'https://www.univ-larochelle.fr/wp-content/uploads/png/logo-universite-de-la-rochelle-2X.png' });



        // Gérer le .ics afin d'afficher la journée en cours (brouillon de debug)
        const ics = Object.values(await getData(url));
        for (let i = 0; i < 10; i++) {
            getJour(ics, i).forEach(event => {
                const tempdate = new Date(event.start);
                console.log(tempdate);
                console.log(event);
                Embed.addFields({name: `${tempdate.toDateString()}, ${tempdate.toTimeString()}`, value: `${event.summary}`, inline: false });
            });

        }
        await interaction.editReply({
            embeds: [Embed],
        });

        // Optionnellement attendre et supprimer la réponse
        //await wait(10_000);
        //interaction.deleteReply();
    },
};

async function getData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            await interaction.editReply({
                content: `Erreur lors de la récupération des données: ${response.status}`,
            });
            throw new Error(`Response status: ${response.status}`);
        }
        return ical.parseICS(await response.text());
    } catch (error) {
        console.error(error.message);
    }
}

//fonction qui a partir du fichier ics retourne les cours de la journée
function getJour(ics, jourapartirdjd) {
    const debut = new Date();
    const fin = new Date();
    debut.setDate(debut.getDate() + jourapartirdjd);
    fin.setDate(debut.getDate() + 1);

    return ics.filter(event => {
        const start = new Date(event.start);
        return start >= debut && start < fin;
    });
}