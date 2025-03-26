const express = require('express');
const router = express.Router();
const { Referral, User } = require('../models');
const authMiddleware = require('../middlewares/auth');
const { referralStatsSchema } = require('../utils/validators');
const handleReferral = require('../services/referral.service')

// Middleware для проверки JWT
router.use(authMiddleware);

/**
 * @route GET /referral/info
 * @desc Получение реферальной информации пользователя
 */
router.get('/info', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Referral,
        as: 'referrals',
        include: [{
          model: User,
          as: 'referee',
          attributes: ['id', 'telegramId', 'createdAt']
        }]
      }],
      attributes: ['id', 'referralLink', 'balance', 'referralCode']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      referralLink: user.referralLink,
      balance: user.balance,
      totalReferrals: user.referrals.length,
      referrals: user.referrals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /referral/stats
 * @desc Получение статистики по уровням рефералов
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await Referral.findAll({
      where: { referrerId: req.user.id },
      attributes: [
        'level',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.col('bonus')), 'totalBonus']
      ],
      group: ['level']
    });

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route POST /referral/generate-link
 * @desc Генерация новой реферальной ссылки
 */
router.post('/generate-link', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newLink = generateReferralLink(); // Ваша функция генерации
    user.referralLink = newLink;
    await user.save();

    res.json({ newLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /referral/top
 * @desc Топ рефералов по уровням
 */
router.get('/top', async (req, res) => {
  try {
    const { error } = referralStatsSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const topReferrals = await Referral.findAll({
      where: { referrerId: req.user.id },
      order: [['level', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(req.query.limit) || 10,
      include: [{
        model: User,
        as: 'referee',
        attributes: ['telegramId', 'createdAt']
      }]
    });

    res.json(topReferrals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;