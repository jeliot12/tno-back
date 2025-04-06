const { User } = require('../models');
const express = require('express');
const router = express.Router();
const { getCachedUser, setCachedUser, calculateEnergy } = require('../utils/cache');

router.get('/user/:telegramId', async (req, res) => {
  const telegramId = req.params.telegramId;
  let userData = getCachedUser(telegramId);

  if (!userData) {
    const user = await User.findOne({ where: { telegramId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log('Fetching from DB for user:', telegramId);
    userData = calculateEnergy(user);
    user.energy = userData.energy;
    user.lastUpdate = userData.lastUpdate;
    await user.save();
    setCachedUser(telegramId, userData);
  } else {
    console.log('Using cached data for user:', telegramId);
    userData = calculateEnergy(userData);
    if (userData.energy < userData.maxEnergy) {
      setCachedUser(telegramId, userData);
      await User.update(
        { energy: userData.energy, lastUpdate: userData.lastUpdate },
        { where: { telegramId } }
      );
    }
  }

  res.json({ energy: userData.energy, maxEnergy: userData.maxEnergy });
});

router.post('/user/:telegramId/click', async (req, res) => {
  const telegramId = req.params.telegramId;
  let userData = getCachedUser(telegramId);

  if (!userData) {
    const user = await User.findOne({ where: { telegramId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log('Fetching from DB for click, user:', telegramId);
    userData = calculateEnergy(user);
    user.energy = userData.energy;
    user.lastUpdate = userData.lastUpdate;
  } else {
    console.log('Using cached data for click, user:', telegramId);
    userData = calculateEnergy(userData);
  }

  if (userData.energy > 0) {
    userData.energy -= 1;
    userData.lastUpdate = new Date();
    setCachedUser(telegramId, userData);

    await User.update(
      { energy: userData.energy, lastUpdate: userData.lastUpdate },
      { where: { telegramId } }
    );

    const ws = req.app.get('clients').get(telegramId);
    if (ws) ws.send(JSON.stringify({ energy: userData.energy, maxEnergy: userData.maxEnergy }));

    res.json({ energy: userData.energy, maxEnergy: userData.maxEnergy });
  } else {
    res.status(400).json({ error: 'Not enough energy' });
  }
});
  
module.exports = router;