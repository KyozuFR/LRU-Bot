// Importation des modules nécessaires
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { getJsonDataFromIcs, getIcsData} = require("../../../project_modules/ics-manager");
const { users } = require('../../dbObjects.js');

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
        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: true });

        const user = await users.findOne({ where: { discordid: interaction.user.id } });
        if (!user) {
            await interaction.editReply('Veuillez d\'abord vous connecter avec la commande /login.');
            return;
        }

        //laissé pour le merge pour montrer l'utilisation.
        let test = await getGroupeEtudiant(`https://apps.univ-lr.fr/cgi-bin/WebObjects/ServeurPlanning.woa/wa/ics?login=${user.lruid}`);
        console.log(test);
        await interaction.editReply(`bibipboop`);
    },
};
async function getGroupeEtudiant(url) {
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