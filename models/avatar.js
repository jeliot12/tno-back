module.exports = (sequelize, DataTypes) => {
  const Avatar = sequelize.define('Avatar', {
    filename: DataTypes.STRING,
    mimetype: DataTypes.STRING,
    data: DataTypes.BLOB('long'),
    creatorId: DataTypes.INTEGER
  }, {});

  Avatar.associate = function(models) {
    Avatar.belongsTo(models.Clan, { // Связь с пользователем
      foreignKey: 'creatorId',
      as: 'clan'
    });
  };

  return Avatar;
};