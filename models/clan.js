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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  return Clan;
};