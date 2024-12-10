// Importation des modules nécessaires
const { ChannelType, SlashCommandBuilder, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
    ComponentType,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const { users, reminders } = require('../../dbObjects.js');
const { getIcsData, getJsonDataFromIcs } = require("../../../project_modules/ics-manager");

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 5,
    // Catégorie de la commande
    category: 'utility',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setDescription('Ajoute/Supprime un rappel pour l\'utilisateur')
        .addIntegerOption(option =>
            option.setName('action')
                .setDescription('Action à effectuer')
                .setRequired(true)
                .addChoices(
                    { name: 'add', value: 0 },
                    { name: 'remove', value: 1 },
                )),

    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */
    async execute(interaction) {
        const start = Date.now();
        const choice = interaction.options.getInteger('action');

        await interaction.deferReply({ ephemeral: true });

        let select = null;
        let row = null;
        let message = null;
        let selectCollector = null;

        switch (choice){
            case 0:
                const dbUser = await users.findOne({ where: { discordid: interaction.user.id } });
                let moodleLink;
                if (dbUser && dbUser.moodlelink) {
                    moodleLink = dbUser.moodlelink;
                } else {
                    await interaction.editReply('Veuillez d\'abord lier un lien moodle avec la commande /login.');
                    return;
                }

                let calendarData;
                try {
                    const icsData = await getIcsData(moodleLink);
                    calendarData = getJsonDataFromIcs(icsData, 1);
                } catch (error) {
                    console.error(`Error fetching ${choice === 0 ? 'Moodle' : 'EDT'} data:`, error);
                    await interaction.editReply(`Impossible de récuperer votre ${choice === 0 ? 'agenda Moodle' : 'EDT'}.`);
                    return;
                }

                select = new StringSelectMenuBuilder()
                    .setCustomId('selectCourse')
                    .addOptions(
                        Object.keys(calendarData).map(index => {
                            const event = calendarData[index][0];
                            return new StringSelectMenuOptionBuilder()
                                .setLabel(event['categories'][0] + ": " + event['summary'])
                                .setValue(index);
                        })
                    );
                row = new ActionRowBuilder()
                    .addComponents(select);
                message = await interaction.editReply({
                    content: 'Selectionnez un evenement pour ajouter un rappel:',
                    components: [row],
                });

                selectCollector = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });
                selectCollector.on('collect', async i => {
                    const selectedEvent = calendarData[i.values[0]][0]
                    await i.update({ content: `Cours selectionné: ${selectedEvent["categories"][0] + ": " + selectedEvent["summary"]}`, components: [] });
                    try {
                        await reminders.create({
                            discordid: interaction.user.id,
                            nom: selectedEvent["categories"][0],
                            description: selectedEvent["summary"],
                            date: selectedEvent["end"]
                        });
                    } catch {
                        await interaction.editReply(`Ce rappel est déjà actif.`);
                    }
                });
                break;
            case 1:
                const remindersList = await reminders.findAll( { where: { discordid: interaction.user.id } });

                select = new StringSelectMenuBuilder()
                    .setCustomId('selectCourse')
                    .addOptions(
                        remindersList.map((reminder, index) => {
                            const { nom, description } = reminder.dataValues;
                            return new StringSelectMenuOptionBuilder()
                                .setLabel(`${nom}: ${description}`)
                                .setValue(index.toString());
                        })
                    );
                row = new ActionRowBuilder()
                    .addComponents(select);
                message = await interaction.editReply({
                    content: 'Selectionnez le rappel à supprimer',
                    components: [row],
                });

                selectCollector = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });
                selectCollector.on('collect', async i => {
                    const selectedEvent = remindersList[i.values[0]].dataValues;

                    await i.update({ content: `Cours selectionné: ${selectedEvent["nom"] + ": " + selectedEvent["description"]}`, components: [] });
                    await reminders.destroy({
                        where: {
                            discordid: interaction.user.id,
                            nom: selectedEvent["nom"],
                            description: selectedEvent["description"],
                            date: selectedEvent["date"]
                        }
                    });
                });
                break;
        }

        await interaction.editReply(`Commande exécutée en ${Date.now() - start}ms.`);
    },
};