const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits} = require('discord.js');

const { users } = require('../../dbObjects.js')

module.exports = {
    cooldown: 0,
    category: 'modtools',
    // Données et  de la commande
    data: new SlashCommandBuilder()
        .setName('forcelogin')
        .setDescription('Permet d\'enregistrer le calendrier moodle/edt de la personne ciblée')
        .addUserOption(option =>
            option.setName('choix-cible')
                .setDescription('Choisissez la personne à qui vous voulez forcer la mise à jour du calendrier')
                .setRequired(true))

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
                .setDescription('URL du calendrier moodle ou nom d\'utilisateur ent')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setContexts(InteractionContextType.Guild),

    /**
     * Exécute la commande de login pour enregistrer un calendrier Moodle ou EDT.
     * @param {CommandInteraction} interaction - L'interaction de commande provenant de Discord.
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        // Récupérer la cible de l'interaction
        const target = interaction.options.getUser('choix-cible');
        // Récupérer le choix de l'utilisateur (0 pour Moodle, 1 pour EDT)
        const choice = interaction.options.getInteger('choix-login');
        // Récupérer l'argument fourni par l'utilisateur (URL ou identifiant)
        const argument = interaction.options.getString('argument');

        // Différer la réponse pour rendre l'interaction éphémère
        await interaction.deferReply({ ephemeral: true });

        // Trouver ou créer une entrée dans la table users pour l'utilisateur Discord
        await users.findOrCreate({
            where: { discordid: target.id },
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
                        await users.update({ moodlelink: argument }, { where: { discordid: target.id } });
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
                        await users.update({ lruid: argument }, { where: { discordid: target.id } });
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
    },
};