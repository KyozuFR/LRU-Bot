// Importation du module nécessaire depuis discord.js
const { Events } = require('discord.js');
const { leave } = require('../../project_modules/leave-manager');

/**
 * Gestionnaire d'événement pour l'événement 'GuildMemberRemove'.
 * évenement déclenché lorsqu'un utilisateur quitte le serveur.
 */
module.exports = {
    // Nom de l'événement
    name: Events.GuildMemberRemove,

    /**
     * Exécute le gestionnaire d'événement.
     * @param {GuildMember} member - L'instance du client Discord.
     */
    execute(member) {
        // Supprimer l'existence de l'utilisateur dans la base de données
        console.log(`L'utilisateur ${member.guild.channels} a quitté le serveur.`);
        leave(member, null);


    },
};