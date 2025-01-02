const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ComponentType, PermissionFlagsBits, InteractionContextType} = require('discord.js');
const { users } = require('../../dbObjects.js');
const { getIcsData, getJsonDataFromIcs } = require("../../../project_modules/ics-manager");
const {licences, groups, groups_users} = require("../../dbObjects");

module.exports = {
    cooldown: 0,
    category: 'modtools',
    // Données et  de la commande
    data: new SlashCommandBuilder()
        .setName('getinfo')
        .setDescription('Permet de récupérer les informations de utilisateur cible')
        .addUserOption(option =>
            option.setName('choix-cible')
                .setDescription('Choisissez la personne dont vous voulez récupérer les informations')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setContexts(InteractionContextType.Guild),

    async execute(interaction) {
        const target = interaction.options.getUser('choix-cible');
        await interaction.deferReply({ ephemeral: true });
        const user = await users.findOne({ where: { discordid: target.id } });
        if (!user) {
            await interaction.editReply('Cet utilisateur n\'est pas enregistré.');
            return;
        }
        let licencesUserName = null;
        let licencesYear = null;
        if (user.licenceid) {
            let licencesUser = await licences.findOne({where: {id: user.licenceid}});
            licencesUserName = licencesUser.name;
            licencesYear = licencesUser.year;
        }
        let strGroup = "";
        for (groups_user of await groups_users.findAll({where: {user: user.discordid}})) {
            let group = await groups.findOne({where: {id: groups_user.group}});
            strGroup += `- ${group.name} \n`;}
        await interaction.editReply(`Informations de ${target.username}:
        - ID Discord: ${user.discordid}
        - ID LR: ${user.lruid}
        - Lien Moodle: ${user.moodlelink}
        - Licence: ${licencesUserName} en L ${licencesYear}
        - Groupes:\n${strGroup}`);

   /**  - Groupe TP: ${groups.findOne({where: {id: groups_users.findOne({where: {user: target.id}}).group}}).name}
        - Groupe TD: ${groups.findOne({where: {id: groups_users.findOne({where: {user: user.id}}).group}}).name}**/
    },
};