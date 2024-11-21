module.exports = (sequelize, DataTypes, licences) => {
    return sequelize.define('users', {
        discordid: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
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
            references: {
                model: licences,
                key: 'name',
            },
            onDelete: 'SET NULL',
            onUpdate: 'RESTRICT',
        }
    }, {
        // Désactiver les timestamps automatiques (createdAt, updatedAt)
        timestamps: false,
    });
};