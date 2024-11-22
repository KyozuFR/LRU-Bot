module.exports = (sequelize, DataTypes) => {
    return sequelize.define('licences', {
        name: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        year: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        id: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        tableName: 'licences',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['name', 'year']
            }
        ]
    });
}