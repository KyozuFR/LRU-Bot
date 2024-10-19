const Sequelize = require('sequelize');

module.exports = async () => {
    const sequelize = new Sequelize('database', 'username', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: 'database.sqlite',
    });

    require('./models/lru-bot.js')(sequelize, Sequelize.DataTypes);

    const force = process.argv.includes('--force') || process.argv.includes('-f');

    sequelize.sync({ force }).then(async () => {
        console.log('Déploiement de la base de données terminé !');

        sequelize.close();
    }).catch(console.error);
}