const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database')['development'];

const sequelize = new Sequelize(config);

const User = require('./user')(sequelize, DataTypes);
const Clan = require('./clan')(sequelize, DataTypes);

User.belongsTo(Clan, { foreignKey: 'clanId' });
Clan.hasMany(User, { foreignKey: 'clanId' });
Clan.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });

module.exports = { sequelize, User, Clan };