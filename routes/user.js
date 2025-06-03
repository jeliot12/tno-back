const express = require('express');
const router = express.Router();
const { User, Clan } = require('../models');


router.get('/:username/id', async (req, res) => {
  try {
    const { username } = req.params;

    // Ищем пользователя по username
    const user = await User.findOne({
      where: { username },
      attributes: ['id'], // Выбираем только поле id
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ id: user.id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/getinfo/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Ищем пользователя
    const user = await User.findOne({
      where: { username },
      attributes: { exclude: ['balance'] } // Исключаем чувствительные данные
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/claninfo/:creatorId', async (req, res) => {
  try {
    const { creatorId } = req.params;

    // Ищем пользователя
    const clan = await Clan.findOne({
      where: { creatorId },
      attributes: { exclude: ['avatarUrl'] } // Исключаем чувствительные данные
    });

    if (!clan) {
      return res.status(404).json({ message: 'Clan not found' });
    }

    res.json(clan);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;