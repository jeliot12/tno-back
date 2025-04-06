const { User } = require('../models');
const express = require('express');
const router = express.Router();



// Получение текущих монет
router.get('/get-coins', async (req, res) => {
  const { telegramId } = req.query;
  const bufferedCoins = coinBuffer.get(telegramId);
  if (bufferedCoins !== undefined) {
    return res.json({ balance: bufferedCoins });
  }

  const user = await User.findOne({ where: { telegramId } });
  res.json({ balance: user ? user.balance : 0 });
});
  
module.exports = router;