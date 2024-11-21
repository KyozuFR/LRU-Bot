// Importation des modules nécessaires
const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ComponentType, AttachmentBuilder} = require('discord.js');

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
                const titleLog = "Manuel de la commande /login :";
                const descriptionLog = "Permet de se connecter à l'Université de La Rochelle pour afficher son emploie du temps";
                const fieldsLog = [{ name: 'Utilisation', value: '/login ‹methode› ‹identifiant›'},
                    { name: 'Methode', value: 'moodle - ent'},
                    { name: 'Cooldown', value: '1s', inline: true },
                    { name: 'Permissions', value: 'Aucune', inline: true }];
                const fileLog1 = new AttachmentBuilder('../assets/help/identifiantEnt.png');
                const fileLog2 = new AttachmentBuilder('../assets/help/LienMoodle1.png');
                const fileLog3 = new AttachmentBuilder('../assets/help/LienMoodle2.png');
                const fileLog4 = new AttachmentBuilder('../assets/help/LienMoodle3.png');
                const fileLog5 = new AttachmentBuilder('../assets/help/LienMoodle4.png');
                const fileLog6 = new AttachmentBuilder('../assets/help/LienMoodle5.png');
                filesLog = [fileLog1, fileLog2, fileLog3, fileLog4, fileLog5, fileLog6];
                const imagesLog = ['attachment://identifiantEnt.png', "attachment://LienMoodle1.png",
                    "attachment://LienMoodle5.png", "attachment://LienMoodle5.png", "attachment://LienMoodle5.png",
                    "attachment://LienMoodle5.png"];
                let curPageLog = 1;
                const titresImageLog = ["Récupération de l'identifiant ENT", "Récupération du lien Moodle - Première étap 1 :",
                    "Récupération du lien Moodle - Première étap 2 :", "Récupération du lien Moodle - Première étap 3 :",
                    "Récupération du lien Moodle - Première étap 4 :", "Récupération du lien Moodle - Première étap 5 :"];
                const messageLog = await interaction.editReply({
                    embeds: [EmbedImage(titleLog, descriptionLog, fieldsLog,titresImageLog[curPageLog-1],
                        imagesLog[curPageLog-1])], files: [filesLog[curPageLog-1]],
                    components: [row]
                });

                const collectorLog = messageLog.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });
                collectorLog.on('collect', async i => {
                    const start = Date.now();
                    curPageLog = i.customId === 'previous' ? Math.max(curPageLog - 1, 1) : Math.min(curPageLog + 1,
                        Object.keys(imagesLog).length);
                    await i.update({ embeds: [EmbedImage(titleLog, descriptionLog, fieldsLog,titresImageLog[curPageLog-1],
                            imagesLog[curPageLog-1])],
                        files: [filesLog[curPageLog-1]] });
                });
                break;


            case 1:
                const titleDis = "Manuel de la commande /display :";
                const descriptionDis = "Permet d'afficher son emploi du temps ou ses activités Moodle";
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
                const titleJoin = "Manuel de la commande /join :";
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
                const titlePing = "Manuel de la commande /ping :";
                const descriptionPing = "Permet de vérifier si le bot est en ligne et son temps de réaction.\n" +
                    "Seule la personne ayant lancé la commande peut voir la réponse.";
                const fieldsPing = [{ name: 'Utilisation', value: '/ping' },
                    { name: 'Cooldown', value: '5s', inline: true },
                    { name: 'Permissions', value: 'Aucune', inline: true }];
                const messagePing = await interaction.editReply({
                    embeds: [createEmbed(titlePing, descriptionPing, fieldsPing)]
                });
                break;


            default:
                const titleHelp = "Manuel des commandes :";
                const descriptionHelp = "Ce bot permet de gérer différents salons et d'affecter un utilisateur en fonction de ses groupes de travail à l'université\n" +
                    "Il permet aussi d'afficher son emploi du temps et ses activités Moodle.";
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

function EmbedImage(title, description, fields, titreImage, image){
    return createEmbed(title, description, fields)
        .addFields({name:titreImage, value:"    "})
        .setImage(image);
}