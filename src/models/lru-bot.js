const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('lru_bot', {
        discordid: {
            type: Sequelize.STRING,
            primaryKey: true,
            unique: true,
        },
        moodlelink: Sequelize.TEXT,
        lruid: Sequelize.STRING,
    }, {
        timestamps: false,
    });
};