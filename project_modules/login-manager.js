const {users} = require("../src/dbObjects");


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
            // Si l'utilisateur a choisi Moodle
            try {
                // Tenter de récupérer les données depuis l'URL fournie
                const response = await fetch(argument);
                if (response.ok) {
                    // Mettre à jour le lien Moodle dans la base de données
                    await users.update({ moodlelink: argument }, { where: { discordid: userused.id } });
                    // Répondre à l'utilisateur que la mise à jour a réussi
                    await interaction.editReply('Moodle mis à jour.');
                } else {
                    // Si la récupération échoue, lancer une erreur
                    throw new Error(`Failed to fetch data. Response status: ${response.status}`);
                }
            } catch {
                // En cas d'erreur, informer l'utilisateur que l'URL Moodle est non valide
                await interaction.editReply('URL moodle non valide.');
                return null;
            }
            break;
        case 1:
            // Si l'utilisateur a choisi EDT
            try {
                // Tenter de récupérer les données depuis l'URL générée avec l'identifiant fourni
                const response = await fetch('https://apps.univ-lr.fr/cgi-bin/WebObjects/ServeurPlanning.woa/wa/ics?login=' + argument);
                if (response.ok) {
                    // Mettre à jour l'identifiant EDT dans la base de données
                    await users.update({ lruid: argument }, { where: { discordid: userused.id } });
                    // Répondre à l'utilisateur que la mise à jour a réussi
                    await interaction.editReply('Edt mis à jour.');
                } else {
                    // Si la récupération échoue, lancer une erreur
                    throw new Error(`Failed to fetch data. Response status: ${response.status}`);
                }
            } catch {
                // En cas d'erreur, informer l'utilisateur que l'identifiant EDT est non valide
                await interaction.editReply('Identifiant edt non valide.');
                return null;
            }
            break;
    }
}

module.exports = {
    login
};