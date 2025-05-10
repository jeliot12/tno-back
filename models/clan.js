module.exports = (sequelize, DataTypes) => {
  const Clan = sequelize.define('Clan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    referralCode: { type: DataTypes.STRING, unique: true, allowNull: false },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    totalCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });
  
  return Clan;
};