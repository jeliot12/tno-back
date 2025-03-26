const express = require('express');
const router = express.Router();
const BalanceService = require("../services/balance.service")
const { balanceSchema } = require('../utils/validators');


router.post('/balance', async (req, res) => {
    try {
      const { error } = balanceSchema.validate(req.body);
      if (error) throw new Error(error.details[0].message);
  
      const { user, token } = await BalanceService.getbalance(req.body.telegramId);
      res.json({ user, token });
    } catch (error) {
      res.status(401).json({ error: error.message});
    }
});

router.post('/balancesave', async (req, res) => {
    try {
      const {telegramId, balance} = req.body
      const { user, token } = await BalanceService.savebalance(telegramId, balance);
      res.json({ user, token });
    } catch (error) {
      res.status(401).json({ error: error.message});
    }
});

module.exports = router