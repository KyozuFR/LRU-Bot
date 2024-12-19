const {groups_users, users, licences, groups} = require("../src/dbObjects");
const {ChannelType} = require("discord.js");


async function leave(interaction, userused){
    const findgroupsuser = await groups_users.findAll({ where: { user: userused.id } });
    if (findgroupsuser.length === 0) {
        await interaction.editReply(`Vous n'êtes pas dans un groupe`);
        return;
    }
    let empty;
    await interaction.editReply(`Leave en cours`);
    for (const group_user of findgroupsuser) {
        let channel = await findChannelId(interaction, group_user.group, ChannelType.GuildText);
        empty = emptyLicence(interaction, channel, userused);
        await group_user.destroy();
    }
    const finduserlicence = await users.findOne({ where: { discordid: userused.id } });
    let category = await findChannelId(interaction, finduserlicence.licenceid, ChannelType.GuildCategory);
    await category.permissionOverwrites.delete(userused.id);
    if (await empty){
        await category.delete();
        await licences.update({ id: null }, { where: { id: category.id } });
    }
    await users.update({ licenceid: null }, { where: { discordid: userused.id } });
    //await groups_users.destroy({where: {user: interaction.user.id}});


    // console.log(findChannelId(interaction,interaction.channelId,ChannelType.GuildText));
    // if (findChannelId(interaction,interaction.channelId,ChannelType.GuildText)){
    //     await interaction.editReply(`Leave terminé`);
    // }
}

async function findChannelId(interaction, scid, objectType) { // à revoir plus tard
    let guildChannels = interaction.guild.channels.cache;
    for (let [id, channel] of guildChannels) {
        if (channel.type === objectType && channel.id === scid) {
            return channel;
        }
    }
    return null;
}
async function emptyLicence(interaction, channel, userused) {
    //vérifier en bdd que la licence n'est associé a aucun utilisateur
    const findgroupsuser = await groups_users.findAll({ where: { group: channel.id } });
    if (findgroupsuser.length === 0) {
        if (channel) {
            channel.delete();
            groups.destroy({where: {id: channel.id}});
            return true;
        }
    } else {
        channel.permissionOverwrites.delete(userused.id);
        return false;
    }
}

module.exports = {leave};