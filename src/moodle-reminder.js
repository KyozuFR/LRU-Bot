const { reminders } = require('./dbObjects.js');

module.exports = async (client) => {
    const remindersList = await reminders.findAll();

    for (const reminder of remindersList) {
        try {
            const reminderData = reminder["dataValues"];
            const today = new Date();
            const reminderDate = new Date(reminderData["date"]);

            if (reminderDate.toDateString() === today.toDateString()) {
                const user = await client.users.fetch(reminderData["discordid"]);
                await user.send("Vous avez des evenement sur moodle: '" + reminderData["nom"] + ": " + reminderData["description"] + "'");
            }
        } catch (error) {
            console.error('Error sending private message:', error);
        }
    }
}