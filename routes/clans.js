const express = require('express');
const router = express.Router();
const { generateReferralLink } = require('../utils/referralGenerator');
const { Clan, User } = require('../models');

// Создать клан
router.post('/', async (req, res) => {
  const { telegramId, name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const user = await User.findOne({ where: { telegramId } });
  if (user.clanId) return res.status(400).json({ error: 'You are already in a clan' });

  try {
    const { code } = await generateReferralLink();
    const clan = await Clan.create({ name, creatorId: user.id, referralCode: code, totalCount: user.balance });
    user.clanId = clan.id;
    await user.save();
    res.status(201).json(clan);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Clan name already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Удалить клан
router.delete('/:id', async (req, res) => {
  const clanId = req.params.id;
  const {telegramId} = req.body
  const user = await User.findOne({ where: { telegramId } });
  const clan = await Clan.findByPk(clanId);
  if (!clan) return res.status(404).json({ error: 'Clan not found' });
  if (clan.creatorId !== user.id) {
    return res.status(403).json({ error: 'Only the creator can delete the clan' });
  }
  await User.update({ clanId: null }, { where: { clanId: clan.id } });
  await clan.destroy();
  res.status(204).send();
});

// Присоединиться к клану
router.post('/:id/join', async (req, res) => {
  const clanId = req.params.id;
  const {telegramId} = req.body
  const user = await User.findOne({ where: { telegramId } });
  if (user.clanId) return res.status(400).json({ error: 'You are already in a clan' });
  const clan = await Clan.findByPk(clanId);
  if (!clan) return res.status(404).json({ error: 'Clan not found' });
  user.clanId = clan.id;
  await user.save();
  res.status(200).json({ message: 'Joined clan successfully' });
});

// Покинуть клан
router.post('/leave', async (req, res) => {
  const {telegramId} = req.body
  const user = await User.findOne({ where: { telegramId } });
  if (!user.clanId) return res.status(400).json({ error: 'You are not in a clan' });
  const clan = await Clan.findByPk(user.clanId);
  if (clan.creatorId === user.id) {
    return res.status(400).json({ error: 'Creator cannot leave; delete the clan instead' });
  }
  user.clanId = null;
  await user.save();
  res.status(200).json({ message: 'Left clan successfully' });
});

// Получить данные клана и топ пользователей
router.get('/info/:id', async (req, res) => {
  const clanId = req.params.id;
  const clan = await Clan.findByPk(clanId, {
    include: [
      { model: User, as: 'creator', attributes: ['id', 'username'] },
      { model: User, attributes: ['id', 'username', 'balance'] },
    ],
  });
  if (!clan) return res.status(404).json({ error: 'Clan not found' });

  const members = clan.Users.sort((a, b) => b.balance - a.balance).map(user => ({
    id: user.id,
    username: user.username,
    balance: user.balance,
  }));
  const topUsers = members.slice(0, 10);
  res.json({
    id: clan.id,
    name: clan.name,
    creator: { id: clan.creator.id, username: clan.creator.username },
    members,
    topUsers,
    totalCount: clan.totalCount,
  });
});

// Получить топ-50 кланов
router.get('/top', async (req, res) => {
  const topClans = await Clan.findAll({
    order: [['totalCount', 'DESC']],
    limit: 50,
    attributes: ['id', 'name', 'totalCount'],
  });
  res.json(topClans);
});

module.exports = router;