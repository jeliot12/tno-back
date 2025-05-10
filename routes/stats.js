const express = require('express');
const router = express.Router();
const { User } = require('../models');

/**
 * @route GET /stats/top
 * @desc Получить топ 50 пользователей по балансу
 */
router.get('/top', async (req, res) => {
  try {
    const topUsers = await User.findAll({
      attributes: ['id', 'telegramId', 'username', 'balance'],
      order: [['balance', 'DESC']],
      limit: 50
    });

    res.json(topUsers);
  } catch (error) {
    console.error('Error fetching top users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/listReferrer', async (req, res) => {
  try {
    const {telegramId} = req.body

    const user = await User.findOne({
      where: { telegramId },
      attributes: ['id'],
      raw: true // Возвращает простой объект вместо экземпляра модели
    });

    const users = await User.findAll({
      where: {
        referrerId: user.id
      }
    });

    if (!users){
      res.status(600).json({ error: 'Not found referral' });
    }

    res.json(users);
  } catch (error) {
    console.error('Error fetching referral:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;