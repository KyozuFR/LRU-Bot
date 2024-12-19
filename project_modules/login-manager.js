const { users } = require("../src/dbObjects");

// Fonction pour traiter la mise à jour de Moodle
async function updateMoodle(argument, userId, interaction) {
    try {
        const response = await fetch(argument);
        if (response.ok) {
            await users.update({ moodlelink: argument }, { where: { discordid: userId } });
            await interaction.editReply('Moodle mis à jour.');
        } else {
            throw new Error(`Failed to fetch data. Response status: ${response.status}`);
        }
    } catch {
        await interaction.editReply('URL moodle non valide.');
        return null;
    }
}

// Fonction pour traiter la mise à jour d'EDT
async function updateEdt(argument, userId, interaction) {
    try {
        const response = await fetch('https://apps.univ-lr.fr/cgi-bin/WebObjects/ServeurPlanning.woa/wa/ics?login=' + argument);
        if (response.ok) {
            await users.update({ lruid: argument }, { where: { discordid: userId } });
            await interaction.editReply('Edt mis à jour.');
        } else {
            throw new Error(`Failed to fetch data. Response status: ${response.status}`);
        }
    } catch {
        await interaction.editReply('Identifiant edt non valide.');
        return null;
    }
}

// Fonction principale de login
async function login(choice, argument, interaction, userused) {
    // Trouver ou créer une entrée dans la table users pour l'utilisateur Discord
    await users.findOrCreate({
        where: { discordid: userused.id },
        defaults: {
            lruid: null,
            moodlelink: null,
        },
    });

    // Traiter le choix de l'utilisateur
    switch (choice) {
        case 0:
            await updateMoodle(argument, userused.id, interaction);
            break;
        case 1:
            await updateEdt(argument, userused.id, interaction);
            break;
        default:
            await interaction.editReply('Choix non valide.');
            break;
    }
}

module.exports = {
    login
};