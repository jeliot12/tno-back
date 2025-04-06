module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      telegramId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      referralCode: {
        type: DataTypes.STRING,
        unique: true
      },
      referralLink: {
        type: DataTypes.STRING,
        unique: true
      },
      balance: {
        type: DataTypes.BIGINT,
        defaultValue: 0
      },
      energy: {
        type: DataTypes.INTEGER,
        defaultValue: 800, // начальная энергия
      },
      maxEnergy: {
        type: DataTypes.INTEGER,
        defaultValue: 800, // максимальная энергия
      },
      lastUpdate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // время последнего обновления
      },
      energyRegenRate: { type: DataTypes.INTEGER, defaultValue: 1 },
      referrerId: {  // ID пользователя, который пригласил текущего
        type: DataTypes.STRING,
        allowNull: true
      },
      isPremium: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    });
  
    User.associate = (models) => {
      User.hasMany(models.Referral, {
        foreignKey: 'referrerId',
        as: 'referrals'
      });
      
      User.belongsTo(models.User, {
        foreignKey: 'referrerId',
        as: 'referrer'
      });
    };
  
    return User;
  };