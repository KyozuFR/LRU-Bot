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
                let curPageLog = 1;
                const messageLog = await interaction.editReply({
                    embeds: [createEmbed(titleLog, descriptionLog)],
                    components: [row]
                });
                const collectorLog = messageLog.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });
                collectorLog.on('collect', async i => {
                    const start = Date.now();
                    await i.update({ embeds: [createEmbed(titleLog, descriptionLog )] });
                });
                break;


            case 1:
                const titleDis = "Manuel de la commande /display";
                const descriptionDis = "Permet d'afficher ton calendrier moodle/edt";
                let curPageDis = 1;
                const messageDis = await interaction.editReply({
                    embeds: [createEmbed(titleDis, descriptionDis)],
                    components: [row]
                });
                const collectorDis = messageDis.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });
                collectorDis.on('collect', async i => {
                    const start = Date.now();
                    await i.update({ embeds: [createEmbed(titleDis, descriptionDis )] });
                });
                break;


            case 2:
                const titleJoin = "Manuel de la commande /join";
                const descriptionJoin = "Permet de rejoindre tes groupes";
                let curPageJoin = 1;
                const messageJoin = await interaction.editReply({
                        embeds: [createEmbed(titleJoin, descriptionJoin)],
                    components: [row]
                });
                const collectorJoin = messageJoin.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });
                collectorJoin.on('collect', async i => {
                    const start = Date.now();
                    await i.update({ embeds: [createEmbed(titleJoin, descriptionJoin )] });
                });
                break;


            case 3:
                const titlePing = "Manuel de la commande /ping";
                const descriptionPing = "Répond pong si le bot est en ligne.";
                let curPagePing = 1;
                const messagePing = await interaction.editReply({
                    embeds: [createEmbed(titlePing, descriptionPing)],
                    components: [row]
                });
                const collectorPing = messagePing.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });
                collectorPing.on('collect', async i => {
                    const start = Date.now();
                    await i.update({ embeds: [createEmbed(titlePing, descriptionPing )] });
                });
                break;


            default:
                const titleHelp = "Manuel des commandes";
                const descriptionHelp = "Liste des commandes disponibles : \n /login \n /display \n /join \n /ping";
                let curPageHelp = 1;
                const messageHelp = await interaction.editReply({
                    embeds: [createEmbed(titleHelp, descriptionHelp)],
                    components: [row]
                });
                const collectorHelp = messageHelp.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });
                collectorHelp.on('collect', async i => {
                    const start = Date.now();
                    await i.update({ embeds: [createEmbed(titleHelp,descriptionHelp )] });
                });
                break;
        }

    },
};

function createEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0x0F6EB1)
        .setTitle(title)
        .setDescription(description)
        .addFields()
        .setTimestamp()
        .setFooter({ text: `Requête réalisé`, iconURL: 'https://images-ext-1.discordapp.net/external/kMhIi1qtRXShjyfpUaFtpeANp0CUby-IxgrbxN6JUhw/https/www.univ-larochelle.fr/wp-content/uploads/png/logo-universite-de-la-rochelle-2X.png' });}

