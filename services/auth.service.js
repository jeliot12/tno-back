const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { handleReferral } = require('./referral.service');
const { generateReferralLink } = require('../utils/referralGenerator');
const { ValidationError, DatabaseError } = require('sequelize');

class AuthService {
  /**
   * Регистрация нового пользователя
   * @param {Object} userData - Данные пользователя
   * @param {string} userData.telegramId - ID пользователя в Telegram
   * @param {string} [userData.referralCode] - Реферальный код пригласителя
   * @returns {Promise<{user: User, token: string}>}
   */
  static async register({telegramId, username , referralCode}) {
    try {
      // Проверка существующего пользователя
      const existingUser = await User.findOne({ where: { telegramId } });
      if (existingUser) {
        throw new Error('User already exists');
      }

          // Поиск реферера по КОДУ
      let referrer = null;
      if (referralCode) {
        referrer = await User.findOne({ 
          where: { referralCode: referralCode },
          attributes: ['id'] // Получаем только ID
        });
      }

      // Генерация реферальных данных
      const { code, link } = await generateReferralLink();

      // Создание пользователя
      const user = await User.create({
        telegramId,
        username: username,
        referralCode: code,
        referralLink: link,
        referrerId: referrer?.id
      });

      // Обработка реферала
      if (referrer) {
        try {
          await handleReferral(referrer.id, user.id);
        } catch (referralError) {
          console.error('Referral processing failed:', referralError);
        }
      }

      // Генерация JWT
      const token = generateToken(user);
      
      return { user, token };
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  /**
   * Авторизация существующего пользователя
   * @param {string} telegramId - ID пользователя в Telegram
   * @returns {Promise<{user: User, token: string}>}
   */
  static async login(telegramId) {
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

    /**
   * Получить реферальную ссылку пользователя
   * @param {string} telegramId - ID пользователя в Telegram
   * @returns {Promise<{user: User, token: string}>}
   */
    static async getrefLink(telegramId) {
      try {
        const link = ['referralLink']
        const user = await User.findOne({ where: { telegramId }, attributes: link});
        
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

module.exports = AuthService;