module.exports = (sequelize, DataTypes, users, groups) => {
    return sequelize.define('groups_users', {
        user: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: users,
                key: 'discordid',
            },
            onDelete: 'CASCADE',
            onUpdate: 'RESTRICT',
            primaryKey: true,
        },
        group: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: groups,
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'RESTRICT',
            primaryKey: true,
        },
    }, {
        // Désactiver les timestamps automatiques (createdAt, updatedAt)
        timestamps: false,
    });
};