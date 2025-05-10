module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      telegramId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      referralCode: {
        type: Sequelize.STRING,
        unique: true
      },
      referralLink: {
        type: Sequelize.STRING,
        unique: true
      },
      balance: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      energy: {
        type: Sequelize.INTEGER,
        defaultValue: 800, // начальная энергия
      },
      maxEnergy: {
        type: Sequelize.INTEGER,
        defaultValue: 800, // максимальная энергия
      },
      lastUpdate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // время последнего обновления
      },
      energyRegenRate: { type: Sequelize.INTEGER, defaultValue: 1 },
      referrerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      clanId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      isPremium: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isSubscribed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isInvite: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Users');
  },
};