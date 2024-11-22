module.exports = (sequelize, DataTypes) => {
    return sequelize.define('groups_users', {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        group_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        }
    }, {
        tableName: 'groups_users',
        timestamps: false
    });
};