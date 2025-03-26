// migrations/YYYYMMDDHHMMSS-add-avatar-to-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Clans', 'avatarUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Clans', 'avatarUrl');
  }
};
