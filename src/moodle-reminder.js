const { reminders } = require('./dbObjects.js');
const { EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
    // Fetch all reminders from the database
    const remindersRawList = await reminders.findAll();

    // Organize reminders by discordid
    const reminderData = {};
    for (const reminderRawData of remindersRawList) {
        const { discordid, nom, description, date } = reminderRawData.dataValues;
        if (!reminderData[discordid]) {
            reminderData[discordid] = [];
        }
        reminderData[discordid].push({ nom, description, date });
    }

    // Iterate over each discordid and send reminders for today
    for (const discordid of Object.keys(reminderData)) {
        const remindersForToday = [];

        for (const reminder of reminderData[discordid]) {
            const reminderDate = new Date(reminder.date);
            const today = new Date();

            if (reminderDate.toDateString() === today.toDateString()) {
                remindersForToday.push({ name: reminder.nom, value: reminder.description, inline: false });

                await reminders.destroy({ where: { discordid, nom: reminder.nom, description: reminder.description, date: reminder.date } });
            }
        }

        if (remindersForToday.length > 0) {
            try {
                const user = await client.users.fetch(discordid);
                await user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x0099ff)
                            .setTitle("Rappel-Moodle")
                            .setDescription(`Vous avez des activités aujourd'hui`)
                            .addFields(remindersForToday)
                            .setTimestamp()
                            .setFooter({ text: 'Université de La Rochelle', iconURL: 'https://images-ext-1.discordapp.net/external/kMhIi1qtRXShjyfpUaFtpeANp0CUby-IxgrbxN6JUhw/https/www.univ-larochelle.fr/wp-content/uploads/png/logo-universite-de-la-rochelle-2X.png' })
                    ]
                });
            } catch (error) {
                console.error('Error sending private message:', error);
            }
        }
    }
}