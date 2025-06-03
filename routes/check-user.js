const { Op } = require('sequelize');
const { User } = require('../models');
const express = require('express');
const router = express.Router();

router.post('/check-user', async (req, res) => {
  try {
    const { telegramId, username } = req.body;
    
    if (!telegramId && !username) {
      return res.status(400).json({ error: 'Необходимо указать ID или username' });
    }
    
    let user;
    if (telegramId && username) {
      user = await User.findOne({
        where: {
          [Op.or]: [
            { telegramId },
            { username }
          ]
        }
      });
    } else if (telegramId) {
      user = await User.findOne({ where: { telegramId } });
    } else {
      user = await User.findOne({ where: { username } });
    }
    
    if (user) {
      return res.status(200).json({ exists: true, message: 'Пользователь уже существует' });
    }
    
    return res.json({ exists: false, message: 'Пользователь не найден' });
  } catch (error) {
    console.error('Ошибка при проверке пользователя:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

  
module.exports = router;