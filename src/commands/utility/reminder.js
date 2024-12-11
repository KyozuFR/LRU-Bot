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

        switch (choice) {
            case 0:
                // Récupérer l'utilisateur de la base de données
                const dbUser = await users.findOne({ where: { discordid: interaction.user.id } });
                let moodleLink;
                if (dbUser && dbUser.moodlelink) {
                    moodleLink = dbUser.moodlelink;
                } else {
                    await interaction.editReply('Veuillez d\'abord lier votre moodle avec la commande /login.');
                    return;
                }

                // Récupérer et convertir les données ICS
                let calendarData;
                try {
                    const icsData = await getIcsData(moodleLink);
                    calendarData = getJsonDataFromIcs(icsData, 1);
                } catch (error) {
                    console.error(`Error fetching Moodle data:`, error);
                    await interaction.editReply(`Impossible de récuperer votre agenda Moodle.`);
                    return;
                }

                // Créer le menu de sélection pour les événements
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('selectCourse')
                    .addOptions(
                        Object.keys(calendarData).map(index => {
                            const event = calendarData[index][0];
                            return new StringSelectMenuOptionBuilder()
                                .setLabel(event['categories'][0] + ": " + event['summary'])
                                .setValue(index);
                        })
                    );

                const actionRow = new ActionRowBuilder().addComponents(selectMenu);
                const selectMessage = await interaction.editReply({
                    content: 'Selectionnez un evenement pour ajouter un rappel:',
                    components: [actionRow],
                });

                // Gérer les interactions du menu de sélection
                const selectCollector = selectMessage.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });
                selectCollector.on('collect', async i => {
                    const selectedEvent = calendarData[i.values[0]][0];
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
                // Récupérer la liste des rappels de l'utilisateur
                const remindersList = await reminders.findAll({ where: { discordid: interaction.user.id } });

                // Créer le menu de sélection pour les rappels
                const removeSelectMenu = new StringSelectMenuBuilder()
                    .setCustomId('selectCourse')
                    .addOptions(
                        remindersList.map((reminder, index) => {
                            const { nom, description } = reminder.dataValues;
                            return new StringSelectMenuOptionBuilder()
                                .setLabel(`${nom}: ${description}`)
                                .setValue(index.toString());
                        })
                    );

                const removeActionRow = new ActionRowBuilder().addComponents(removeSelectMenu);
                const removeMessage = await interaction.editReply({
                    content: 'Selectionnez le rappel à supprimer',
                    components: [removeActionRow],
                });

                // Gérer les interactions du menu de sélection
                const removeCollector = removeMessage.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });
                removeCollector.on('collect', async i => {
                    const selectedEvent = remindersList[i.values[0]].dataValues;
                    await i.update({ content: `Cours selectionné: '${selectedEvent["nom"]}': '${selectedEvent["description"]}'`, components: [] });
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