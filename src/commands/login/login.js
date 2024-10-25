const { SlashCommandBuilder } = require('discord.js');
const ical = require('ical');

const { lruBot } = require('../../dbObjects.js')

module.exports = {
    cooldown: 0,
    category: 'login',
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Permet d\'enregistrer ton calendrier moodle/edt')
        .addIntegerOption(option =>
            option.setName('choix-login')
                .setDescription('Choisissez le type de calendrier à enregistrer')
                .setRequired(true)
                .addChoices(
                    { name: 'moodle', value: 0 },
                    { name: 'edt', value: 1 },
                ))
        .addStringOption(option =>
            option.setName('argument')
                .setDescription('URL de votre calendrier moodle ou nom d\'utilisateur ent')
                .setRequired(true)),

    async execute(interaction) {
        const choice = interaction.options.getInteger('choix-login');
        const argument = interaction.options.getString('argument');

        await interaction.deferReply({ ephemeral: true });

        try {
            if ((await lruBot.findAll({ where: { discordid: interaction.user.id } })).length === 0) {
                await lruBot.create({
                    discordid: interaction.user.id,
                    moodlelink: null,
                    lruid: null,
                });
            }
        } catch {
            await interaction.editReply('Something went wrong with adding a tag.');
        }

        if (choice === 0) {
            try {
                const response = await fetch(argument);
                if (response.ok) {
                    await lruBot.update({ moodlelink: argument }, { where: { discordid: interaction.user.id } });

                    await interaction.editReply('Data updated.');
                }
                else {
                    throw new Error(`Failed to fetch data. Response status: ${response.status}`);
                }
            }
            catch (error) {
                await interaction.editReply('Something went wrong with updating moodle.');
            }
        } else if (choice === 1) {
            try {
                const response = await fetch('https://srv.lru.brno.fr/ics/'+argument);
                if (response.ok) {
                    await lruBot.update({ lruid: argument }, { where: { discordid: interaction.user.id } });

                    await interaction.editReply('Data updated.');
                }
                else {
                    throw new Error(`Failed to fetch data. Response status: ${response.status}`);
                }
            }
            catch (error) {
                await interaction.editReply('Something went wrong with updating edt.');
            }
        }
    },
};