const { groups_users, users, licences, groups } = require("../src/dbObjects");
const { ChannelType } = require("discord.js");

/**
 * Fonction pour quitter un groupe.
 * @param {Interaction} interaction - L'objet interaction de Discord.js.
 * @param {User} user - L'utilisateur qui quitte le groupe.
 */
async function leave(interaction, user) {
    const userGroups = await groups_users.findAll({ where: { user: user.id } });
    if (userGroups.length === 0) {
        await interaction.editReply(`Vous n'êtes pas dans un groupe`);
        return;
    }
    let isEmpty = false;
    await interaction.editReply(`Leave en cours`);
    for (const groupUser of userGroups) {
        const channel = await findChannelById(interaction, groupUser.group, ChannelType.GuildText);
        isEmpty = handleEmptyLicence(interaction, channel, user);
        await groupUser.destroy();
    }

    const userLicence = await users.findOne({ where: { discordid: user.id } });
    const category = await findChannelById(interaction, userLicence.licenceid, ChannelType.GuildCategory);
    await category.permissionOverwrites.delete(user.id);

    if (await isEmpty) {
        await category.delete();
        await licences.update({ id: null }, { where: { id: category.id } });
    }

    await users.update({ licenceid: null }, { where: { discordid: user.id } });
}

/**
 * Fonction pour trouver un canal par ID.
 * @param {Interaction} interaction - L'objet interaction de Discord.js.
 * @param {string} channelId - L'ID du canal.
 * @param {string} channelType - Le type de canal.
 * @returns {Channel|null} - Le canal trouvé ou null.
 */
async function findChannelById(interaction, channelId, channelType) {
    const guildChannels = interaction.guild.channels.cache;
    for (const [id, channel] of guildChannels) {
        if (channel.type === channelType && channel.id === channelId) {
            return channel;
        }
    }
    return null;
}

/**
 * Fonction pour gérer les licences vides.
 * @param {Interaction} interaction - L'objet interaction de Discord.js.
 * @param {Channel} channel - Le canal à vérifier.
 * @param {User} user - L'utilisateur à vérifier.
 * @returns {boolean} - True si la licence est vide, sinon false.
 */
async function handleEmptyLicence(interaction, channel, user) {
    const groupUsers = await groups_users.findAll({ where: { group: channel.id } });
    if (groupUsers.length === 0) {
        if (channel) {
            await channel.delete();
            await groups.destroy({ where: { id: channel.id } });
            return true;
        }
    } else {
        await channel.permissionOverwrites.delete(user.id);
        return false;
    }
}

module.exports = { leave };