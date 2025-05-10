module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Referrals', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      bonus: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING, // Изменено с ENUM на STRING
        defaultValue: 'active',
        allowNull: false,
        validate: {
          isIn: [['active', 'expired']] // Валидация на уровне БД
        }
      },
      referrerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      refereeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
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

    // Добавляем ограничение CHECK
    await queryInterface.sequelize.query(`
      ALTER TABLE "Referrals"
      ADD CONSTRAINT check_status
      CHECK (status IN ('active', 'expired'))
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Referrals');
  }
};