// Importation des modules nécessaires
const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ComponentType } = require('discord.js');

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 1,
    // Catégorie de la commande
    category: 'utility',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription(`Renvoie les commande existantes et l'aide de la commande en argument`)
        .addIntegerOption(option =>
            option.setName('choix-commande')
                .setDescription('Choisissez la commande pour laquelle vous souhaitez obtenir de l\'aide')
                .addChoices(
                    { name: 'login', value: 0 },
                    { name: 'display', value: 1 },
                    { name: 'join', value: 2 },
                    { name: 'ping', value: 3 },
                )),
    /**
     * Logique d'exécution de la commande.
     * @param {Interaction} interaction - L'objet interaction de Discord.js
     */
    async execute(interaction) {
        const choice = interaction.options.getInteger('choix-commande');
        // Différer la réponse à l'interaction
        await interaction.deferReply({ ephemeral: true });
        const previous = new ButtonBuilder().setCustomId('previous').setLabel('◀️').setStyle(ButtonStyle.Primary);
        const next = new ButtonBuilder().setCustomId('next').setLabel('▶️').setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder().addComponents(previous, next);


        switch (choice){
            case 0:
                const titleLog = "Manuel de la commande /login";
                const descriptionLog = "Permet de se connecter à l'Université de La Rochelle pour afficher son emploie du temps";
                const fieldsLog = [{ name: 'Utilisation', value: '/login ‹methode› ‹identifiant›'},
                    { name: 'Methode', value: 'moodle - ent'},
                    { name: 'Cooldown', value: '1s', inline: true },
                    { name: 'Permissions', value: 'Aucune', inline: true }];
                let curPageLog = 1;
                const messageLog = await interaction.editReply({
                    embeds: [createEmbed(titleLog, descriptionLog, fieldsLog)],
                    components: [row]
                });

                const collectorLog = messageLog.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });
                collectorLog.on('collect', async i => {
                    const start = Date.now();
                    await i.update({ embeds: [createEmbed(titleLog, descriptionLog, fieldsLog)] });
                });
                break;


            case 1:
                const titleDis = "Manuel de la commande /display";
                const descriptionDis = "Permet d'afficher son emploie du temps ou ses activité moodle";
                const fieldsDis = [{ name: 'Utilisation', value: '/display ‹methode›' },
                    { name: 'Methode', value: 'moodle - edt'},
                    { name: 'Cooldown', value: '0s', inline: true },
                    { name: 'Permissions', value: 'Aucune', inline: true }];
                let curPageDis = 1;
                const messageDis = await interaction.editReply({
                    embeds: [createEmbed(titleDis, descriptionDis, fieldsDis)],
                });
                break;


            case 2:
                const titleJoin = "Manuel de la commande /join";
                const descriptionJoin = "Permet de rejoindre tes groupes";
                const fieldsJoin = [{ name: 'Utilisation', value: '/join ‹licence› ‹année›' },
                    { name: 'Année', value: 'L1 - L2 - L3'},
                    { name: 'Cooldown', value: '5s', inline: true },
                    { name: 'Permissions', value: 'Aucune', inline: true }];
                let curPageJoin = 1;
                const messageJoin = await interaction.editReply({
                        embeds: [createEmbed(titleJoin, descriptionJoin, fieldsJoin)]
                });
                break;


            case 3:
                const titlePing = "Manuel de la commande /ping";
                const descriptionPing = "Permet de verifier si le bot est en ligne et son temps de reaction.\n" +
                    "Seule la personne ayant lancé la commande peut voir la réponse";
                const fieldsPing = [{ name: 'Utilisation', value: '/ping' },
                    { name: 'Cooldown', value: '5s', inline: true },
                    { name: 'Permissions', value: 'Aucune', inline: true }];
                const messagePing = await interaction.editReply({
                    embeds: [createEmbed(titlePing, descriptionPing, fieldsPing)]
                });
                break;


            default:
                const titleHelp = "Manuel des commandes";
                const descriptionHelp = "Ce bot permet de pouvoir gere differents salon et affecter un utilisateur en fonction de ses groupe de travail a l'université\n" +
                    "Il permet aussi de pouvoir afficher son emploie du temps et ses activité moodle";
                const fieldsHelp = [{ name: 'Commandes', value: '/login\n/display\n/join\n/ping' },
                    { name: 'Utilisation', value: "/help ‹commande›" },
                    { name: 'Cooldown', value: '1s', inline: true }];

                let curPageHelp = 1;
                const messageHelp = await interaction.editReply({
                    embeds: [createEmbed(titleHelp, descriptionHelp, fieldsHelp)]
                });
                break;
        }
    },
};

function createEmbed(title, description, fields) {
    return new EmbedBuilder()
        .setColor(0x0F6EB1)
        .setTitle(title)
        .setDescription(description)
        .addFields(fields)
        .setTimestamp()
        .setFooter({ text: `Requête réalisé`, iconURL: 'https://images-ext-1.discordapp.net/external/kMhIi1qtRXShjyfpUaFtpeANp0CUby-IxgrbxN6JUhw/https/www.univ-larochelle.fr/wp-content/uploads/png/logo-universite-de-la-rochelle-2X.png' });}

function EmbedImage(title, description, fields, image){
    return createEmbed(title, description, fields)
        .setImage(image);
}