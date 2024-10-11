// Importation des modules nécessaires
const { SlashCommandBuilder, PermissionFlagsBits  } = require('discord.js');

module.exports = {
    // Délai de rechargement de la commande en secondes
    cooldown: 15,
    // Catégorie de la commande
    category: 'dev',
    // Données et options de la commande
    data: new SlashCommandBuilder()
        .setName('array-sorter')
        .setDescription('Tri un array de n éléments, pour simuler une commande longue à traiter')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription("Nombre d'éléments à trier"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    /**
     * Exécute la commande array-sorter.
     * @param {CommandInteraction} interaction - L'objet interaction représentant la commande.
     */
    async execute(interaction) {
        const start = Date.now();

        // Obtenir le nombre d'éléments à trier à partir des options de commande, par défaut à 1000 si non fourni
        const nb = interaction.options.getInteger('number') ?? 1000;

        // Différer la réponse pour rendre l'interaction éphémère
        await interaction.deferReply({ ephemeral: true });

        // Informer l'utilisateur de la création du tableau
        await interaction.editReply({ content: `Création du tableau de ${nb} éléments` });

        // Créer un tableau d'entiers aléatoires
        const array = Array.from({ length: nb }, () => Math.floor(Math.random() * nb));

        // Algorithme de tri par sélection avec mises à jour de progression
        for (let i = 0; i < array.length; i++) {
            const progress = i / array.length;
            if (progress === 0.25 || progress === 0.5 || progress === 0.75) {
                await interaction.editReply({ content: `Tableau trié ${Math.round(progress * 100)}%` });
            }

            let minIndex = i;
            for (let j = i + 1; j < array.length; j++) {
                if (array[j] < array[minIndex]) {
                    minIndex = j;
                }
            }
            if (minIndex !== i) {
                [array[i], array[minIndex]] = [array[minIndex], array[i]];
            }
        }

        // Informer l'utilisateur que le tri est terminé
        await interaction.editReply({
            content: `Tableau trié 100%: ${interaction.user} | en ${Date.now() - start}ms`,
        });
    },
};