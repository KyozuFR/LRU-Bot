module.exports = (sequelize, DataTypes) => {
    return sequelize.define('licences', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: true,
            primaryKey: true,
        },
    }, {
        // Désactiver les timestamps automatiques (createdAt, updatedAt)
        timestamps: false,
    });
};