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
        type: DataTypes.INTEGER,
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
      clanId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isPremium: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isSubscribed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isInvite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
    });

    User.addHook('afterCreate', async (user) => {
      if (user.clanId) {
        const clan = await sequelize.models.Clan.findByPk(user.clanId);
        if (clan) {
          clan.totalCount += user.balance;
          await clan.save();
        }
      }
    });

    User.addHook('afterUpdate', async (user, options) => {
      const previous = user._previousDataValues;
      if (previous.clanId !== user.clanId) {
        if (previous.clanId) {
          const oldClan = await sequelize.models.Clan.findByPk(previous.clanId);
          if (oldClan) {
            oldClan.totalCount -= previous.balance;
            await oldClan.save();
          }
        }
        if (user.clanId) {
          const newClan = await sequelize.models.Clan.findByPk(user.clanId);
          if (newClan) {
            newClan.totalCount += user.balance;
            await newClan.save();
          }
        }
      } else if (previous.balance !== user.balance && user.clanId) {
        const clan = await sequelize.models.Clan.findByPk(user.clanId);
        if (clan) {
          const difference = user.balance - previous.balance;
          clan.totalCount += difference;
          await clan.save();
        }
      }
    });

    User.addHook('beforeDestroy', async (user) => {
      if (user.clanId) {
        const clan = await sequelize.models.Clan.findByPk(user.clanId);
        if (clan) {
          clan.totalCount -= user.balance;
          await clan.save();
        }
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