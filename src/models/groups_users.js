// Importation des modules nécessaires
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('groups_users', {
        user: {
            type: Sequelize.STRING,
            foreignKey: true,
        },
        group: {
            type: Sequelize.STRING,
            foreignKey: true,
        },
    }, {
        // Désactiver les timestamps automatiques (createdAt, updatedAt)
        timestamps: false,
    });
};