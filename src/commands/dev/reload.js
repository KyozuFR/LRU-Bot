// Importation des modules nécessaires
const { SlashCommandBuilder, PermissionFlagsBits  } = require('discord.js');

/**
 * Commande pour recharger une commande spécifique ou toutes les commandes.
 */
module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 0,
    // Catégorie de la commande
    category: 'dev',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Recharge une commande spécifique ou toutes les commandes.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('La commande à recharger. Utilisez "all" pour recharger toutes les commandes.'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    /**
     * Exécute la commande de rechargement.
     * @param {CommandInteraction} interaction - L'interaction de commande.
     */
    async execute(interaction) {
        const start = Date.now();
        const commandName = interaction.options.getString('command')?.toLowerCase();

        await interaction.deferReply({ ephemeral: true });

        if (!commandName || commandName === 'all') {
            // Recharge toutes les commandes
            for (const command of interaction.client.commands.values()) {
                delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];
                const newCommand = require(`../${command.category}/${command.data.name}.js`);
                interaction.client.commands.set(newCommand.data.name, newCommand);
            }
        } else {
            // Recharge une commande spécifique
            const command = interaction.client.commands.get(commandName);

            if (!command) {
                await interaction.editReply({ content: `La commande \`${commandName}\` n'a pas été trouvée.` });
                return;
            }

            delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];
            const newCommand = require(`../${command.category}/${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
        }

        await interaction.editReply({
            content: `Commande(s) rechargée(s) par ${interaction.user} en ${Date.now() - start}ms`,
        });
    },
};