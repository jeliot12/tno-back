const express = require('express');
const router = express.Router();
const { User } = require('../models');

async function bonusUser(telegramId, username, amount) {

    try {
      const updatedCount = await User.increment('balance', {
        by: Number(amount), // Указываем, на сколько увеличить
        where: { telegramId, username },
        returning: true, // Возвращает обновлённую запись (PostgreSQL)
      });
  
      if (updatedCount === 0) {
        console.error("User not found");
      }
  
      console.log("success: true")
    } catch (error) {
      console.error(error);
      console.log("server errpr")
    }  
  }

router.get('/tasks/:telegramId', async (req, res) => {
    try {
      const { telegramId } = req.params;
      
      // Найти пользователя и получить только email и age
      const user = await User.findOne({
        where: { telegramId },
        attributes: ['isSubscribed', 'isInvite'], // Указываем нужные поля
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
});

router.post('/invite', async (req, res) => {
  try {
    const { telegramId, username } = req.body;

    // Находим пользователя
    const user = await User.findOne({
      where: { telegramId },
      attributes: ['id'],
      raw: true
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Считаем количество рефералов
    const referralCount = await User.count({
      where: {
        referrerId: user.id
      }
    });
    const invite = true
    if (referralCount < 10){
        const newReferralCount = 10 - referralCount;
        return res.json({message: `Чтобы получить бонус пригласите еще ${newReferralCount}`})
    }
    const [affectedRows] = await User.update(
        { isInvite: true },
        {
          where: { telegramId },
          returning: true, // Для PostgreSQL возвращает обновленную запись
        }
    );
    if (affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
    }
    await bonusUser(telegramId, username, 5000)
    res.json({ 
      message: 'Бонусные монеты вам начислены на баланс!',
      isInvite: invite
    });
  } catch (error) {
    console.error('Error fetching referral:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;