module.exports = (sequelize, DataTypes) => {
    return sequelize.define('groups', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        }
    }, {
        tableName: 'groups',
        timestamps: false
    });
};