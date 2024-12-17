// Importation des modules nécessaires
const { SlashCommandBuilder, ChannelType} = require('discord.js');
const { groups_users } = require('../../dbObjects.js');
const { users } = require('../../dbObjects.js');
const {licences, groups} = require("../../dbObjects");

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 5,
    // Catégorie de la commande
    category: 'utility',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Quitte le groupe'),

    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */
    async execute(interaction) {
        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: true });

        const findgroupsuser = await groups_users.findAll({ where: { user: interaction.user.id } });
        if (findgroupsuser.length === 0) {
            await interaction.editReply(`Vous n'êtes pas dans un groupe`);
            return;
        }
        let empty;
        await interaction.editReply(`Leave en cours`);
        for (const group_user of findgroupsuser) {
            let channel = await findChannelId(interaction, group_user.group, ChannelType.GuildText);
            empty = emptyLicence(interaction, channel);
            await group_user.destroy();
        }
        const finduserlicence = await users.findOne({ where: { discordid: interaction.user.id } });
        let category = await findChannelId(interaction, finduserlicence.licenceid, ChannelType.GuildCategory);
        await category.permissionOverwrites.delete(interaction.user.id);
        if (await empty){
            await category.delete();
            await licences.update({ id: null }, { where: { id: category.id } });
        }
        await users.update({ licenceid: null }, { where: { discordid: interaction.user.id } });
        //await groups_users.destroy({where: {user: interaction.user.id}});


        // console.log(findChannelId(interaction,interaction.channelId,ChannelType.GuildText));
        // if (findChannelId(interaction,interaction.channelId,ChannelType.GuildText)){
        //     await interaction.editReply(`Leave terminé`);
        // }
    },
};

async function findChannelId(interaction, scid, objectType) { // à revoir plus tard
    let guildChannels = interaction.guild.channels.cache;
    for (let [id, channel] of guildChannels) {
        if (channel.type === objectType && channel.id === scid) {
            return channel;
        }
    }
    return null;
}
async function emptyLicence(interaction, channel) {
    //vérifier en bdd que la licence n'est associé a aucun utilisateur
    const findgroupsuser = await groups_users.findAll({ where: { group: channel.id } });
    if (findgroupsuser.length === 0) {
        if (channel) {
            channel.delete();
            groups.destroy({where: {id: channel.id}});
            return true;
        }
    } else {
        channel.permissionOverwrites.delete(interaction.user.id);
        return false;
    }
}

