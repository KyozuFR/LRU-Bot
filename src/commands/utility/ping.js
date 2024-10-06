const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        // Create buttons for Discord.js documentation and guide
        const discordjsdoc = new ButtonBuilder()
            .setLabel('Discord.jS Docs')
            .setURL("https://discord.js.org/docs/packages/discord.js/14.16.3")
            .setStyle(ButtonStyle.Link);

        const discordjsguide = new ButtonBuilder()
            .setLabel('Discord.jS Guide')
            .setURL("https://discordjs.guide/#before-you-begin")
            .setStyle(ButtonStyle.Link);

        // Create an action row and add the buttons to it
        const row = new ActionRowBuilder()
            .addComponents(discordjsdoc, discordjsguide);

        // Defer the reply to the interaction
        await interaction.deferReply({ ephemeral: true });
        const reply = await interaction.fetchReply();

        // Edit the reply with the latency information
        interaction.editReply({
            content: `Pong: ${interaction.user} | Latence: ${reply.createdTimestamp - interaction.createdTimestamp}ms`
        });

        // Wait for 10 seconds and then delete the reply
        await wait(10_000);
        interaction.deleteReply();
    },
};