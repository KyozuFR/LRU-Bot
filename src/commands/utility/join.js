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
    let tab = {};
    for (const event in calendarData) {
        let tmp = calendarData[event].summary.split(';');
        tmp = tmp.slice(1,tmp.length).join(';');
        const regex = /\b(TD|TP|TEA)(_\w+\d?[a-zA-Z]?)?\b/g;

        const matches = [];
        let match;

        while ((match = regex.exec(tmp)) !== null) {
            matches.push(match[0]);  // Ajouter la correspondance trouvée dans le tableau
        }
        /*
        Liste de chose a faire,
        gérer le nombre de groupe diférent et si il est supérieur a 1, ne pas le prendre en compte
        Une fois qu'on a le groupe on prend les éléments derrière le [ jusqu'au ; afin d'avoir le nom de la matière
        on met les 2 dans un dictionaire et voila, on a les groupe et les matières
         */
        if (matches.length === 1) {
            //console.log(matches);
            tmp = tmp.split(';');
            for (const findtd in tmp){
                if (tmp[findtd].includes(matches[0])){
                    //console.log(tmp[findtd]);
                    tab[tmp[findtd].split('[')[0]] = matches[0];
                }
            }
            // La valeur de match[0] est l'occurrence trouvée
        } else {
            continue;
        }
        count++;
    }
    return tab;

}