// Importation des modules nécessaires
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('licences', {
        id: {
            type: Sequelize.STRING,
            primaryKey: true,
            unique: true,
        },
        name: Sequelize.STRING,
        year: Sequelize.INTEGER,
    }, {
        // Désactiver les timestamps automatiques (createdAt, updatedAt)
        timestamps: false,
    });
};