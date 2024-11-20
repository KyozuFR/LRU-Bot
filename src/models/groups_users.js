module.exports = (sequelize, DataTypes) => {
    return sequelize.define('groups_users', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'users',
                key: 'discordid',
            },
        },
        group: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'groups',
                key: 'id',
            },
        },
    }, {
        // Désactiver les timestamps automatiques (createdAt, updatedAt)
        timestamps: false,
    });
};