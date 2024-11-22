module.exports = (sequelize, DataTypes) => {
    return sequelize.define('users', {
        discordid: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        lruid: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        moodlelink: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        licencename: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        licenceyear: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    }, {
        tableName: 'users',
        timestamps: false
    });
};