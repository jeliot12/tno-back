const { User } = require('../models');
const express = require('express');
const router = express.Router();

router.get('/coins', async (req, res) => {
    try {
      const user = await User.findByPk(28);
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
  
      const [user, created] = await User.upsert({
        id: 28,
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