// Importation des modules nécessaires
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('groups', {
        id: {
            type: Sequelize.STRING,
            primaryKey: true,
            unique: true,
        },
        name: Sequelize.STRING,
    }, {
        // Désactiver les timestamps automatiques (createdAt, updatedAt)
        timestamps: false,
    });
};