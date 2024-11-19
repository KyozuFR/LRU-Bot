// Importation des modules nécessaires
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('licences', {
        name: {
            type: Sequelize.STRING,
            primaryKey: true,
            unique: true,
        },
        id: {
            type: Sequelize.STRING,
            unique: true,
        },
        year: Sequelize.INTEGER,
    }, {
        // Désactiver les timestamps automatiques (createdAt, updatedAt)
        timestamps: false,
    });
};