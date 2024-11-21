module.exports = (sequelize, DataTypes) => {
    return sequelize.define('groups', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        // Désactiver les timestamps automatiques (createdAt, updatedAt)
        timestamps: false,
    });
};