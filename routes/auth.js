const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../utils/validators');

router.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    const { user, token } = await AuthService.register(req.body);
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    const { user, token } = await AuthService.login(req.body.telegramId);
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message});
  }
});

router.post('/reflink', async (req, res) => {
  try {
    const { user, token } = await AuthService.getrefLink(req.body.telegramId);
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message});
  }
});

module.exports = router