// Importation des modules nécessaires
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('reminders', {
        discordid: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        nom: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        description: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        date: {
            type: Sequelize.DATE,
            primaryKey: true,
        },
    }, {
        // Désactiver les timestamps automatiques (createdAt, updatedAt)
        timestamps: false,
    });
};