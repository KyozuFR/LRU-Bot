// Importation des modules nécessaires
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('licences', {
        name: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        id: {
            type: Sequelize.STRING,
            unique: true,
        },
        year: {
            type: Sequelize.INTEGER,
            primaryKey: true,
        }
    }, {
        // Désactiver les timestamps automatiques (createdAt, updatedAt)
        timestamps: false,
    });
};