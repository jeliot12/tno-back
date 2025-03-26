const { Sequelize, DataTypes } = require('sequelize'); // Импортируем DataTypes
const config = require('../config/database')['development'];

const sequelize = new Sequelize(config);

// Передаем sequelize и DataTypes в модели
const User = require('./user')(sequelize, DataTypes);
const Clan = require('./clan')(sequelize, DataTypes);

// Устанавливаем ассоциации
User.belongsTo(Clan, { foreignKey: 'clanId' });
Clan.hasMany(User, { foreignKey: 'clanId' });
Clan.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });

module.exports = { sequelize, User, Clan };