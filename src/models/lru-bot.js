// Importation des modules nécessaires
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    // Définir le modèle 'lru_bot' avec les champs 'discordid', 'moodlelink' et 'lruid'
    return sequelize.define('lru_bot', {
        // Champ 'discordid' de type STRING, utilisé comme clé primaire et unique
        discordid: {
            type: Sequelize.STRING,
            primaryKey: true,
            unique: true,
        },
        // Champ 'moodlelink' de type TEXT
        moodlelink: Sequelize.TEXT,
        // Champ 'lruid' de type STRING
        lruid: Sequelize.STRING,
    }, {
        // Désactiver les timestamps automatiques (createdAt, updatedAt)
        timestamps: false,
    });
};