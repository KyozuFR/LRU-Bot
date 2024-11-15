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
    //console.log(calendarData);
    let count = 0;
    let tab = [];
    for (const event in calendarData) {
        //vérifier que le nom de l'événement n'est pas déja dans tab
        let tmp = calendarData[event].summary.split(';');
        tmp = tmp.slice(1,tmp.length).join(';');
        const match = tmp.match(/\b(TD|TP|TEA)(_\w+)?\b/i);
        if (match) {
            console.log("Occurrence trouvée :", match);
            tab.push(match[0]);// Affiche "TD"
            // La valeur de match[0] est l'occurrence trouvée
        } else {
            console.log("Aucune occurrence trouvée.");
            continue;
        }
        count++;
    }
    return tab;

}