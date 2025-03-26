module.exports = (sequelize, DataTypes) => {
    const Referral = sequelize.define('Referral', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      bonus: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
        validate: {
          isIn: [['active', 'expired']]
        }
      }
    });
  
    Referral.associate = (models) => {
      Referral.belongsTo(models.User, {
        foreignKey: 'referrerId',
        as: 'referrer'
      });
      
      Referral.belongsTo(models.User, {
        foreignKey: 'refereeId',
        as: 'referee'
      });
    };
  
    return Referral;
  };