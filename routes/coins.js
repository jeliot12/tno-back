const { User } = require('../models');
const express = require('express');
const router = express.Router();

router.get('/coins/:telegramId', async (req, res) => {
    const telegramId = req.params.telegramId;
    try {
      const user = await User.findOne({ where: { telegramId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ balance: user.balance });
    } catch (error) {
      console.error('GET /balance error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});
  
router.post('/coins', async (req, res) => {
    try {
      const { telegramId, username, balance } = req.body;
      
      if (typeof balance !== 'number' || balance < 0) {
        return res.status(400).json({ error: 'Invalid coins value' });
      }
  
      const [user] = await User.upsert({
        telegramId: telegramId,
        username: username,
        balance: balance
      }, {
        returning: true
      });
  
      res.json({ success: true, balance: user.balance });
    } catch (error) {
      console.error('POST /balance error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});
  
module.exports = router;