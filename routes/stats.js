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

module.exports = router;