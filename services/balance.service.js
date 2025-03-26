const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { ValidationError, DatabaseError } = require('sequelize');

class BalanceService {
  /**
   * Авторизация существующего пользователя
   * @param {string} telegramId - ID пользователя в Telegram
   * @returns {Promise<{user: User, token: string}>}
   */
  static async getbalance(telegramId) {
    try {
        const coin = ['balance']
        const user = await User.findOne({ where: { telegramId }, attributes: coin});
        
        if (!user) {
          throw new Error('User not found');
        }
  
        // Обновление токена
        const token = generateToken(user);
        
        return { user, token };
      } catch (error) {
        this.handleAuthError(error);
      }
  }

  static async savebalance(telegramId, balance) {
    try {
        // Обновляем данные пользователя
        const coin = {balance: balance}
        const [affectedRows] = await User.update(coin, {
            where: { telegramId },
            returning: true // Для PostgreSQL возвращает обновленную запись
        });
      
        if (affectedRows === 0) {
            throw new Error('User not found');
        }

      // Обновление токена
      const user = User.findOne({ where: { telegramId }, attributes: ['balance']});
      const token = generateToken(user);

      return { user, token };
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  /**
   * Обработка ошибок аутентификации
   * @param {Error} error - Ошибка
   */
  static handleAuthError(error) {
    console.error('Auth error:', error);
    
    if (error instanceof ValidationError) {
      throw new Error('Invalid user data');
    }
    if (error instanceof DatabaseError) {
      throw new Error('Database operation failed');
    }
    throw error;
  }
}

module.exports = BalanceService;