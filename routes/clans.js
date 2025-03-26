const express = require('express');
const router = express.Router();
const ClansService = require('../services/clans.service');

// Create a clan
router.post('/create', async (req, res) => {
    try {
        const { clan, token } = await ClansService.createClan(req.body);
        res.json({ clan, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a clan
router.delete('/delete', async (req, res) => {
  try {
    const { clan, token } = await ClansService.deleteClan(req.body);
    res.status(204).json({clan, token});
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Join a clan
router.post('/join', async (req, res) => {
  try {
    const {clan, token} = await ClansService.joinClan(req.body)
    res.status(204).json({clan, token, message: 'Successfully joined the clan'});
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// join a clan with referralLink
router.post('/join/ref', async (req, res) => {
    try {
      const {clan, token} = await ClansService.joinClanRef(req.body);
      res.status(200).json({clan, token, message: 'Joined clan successfully!' }); 
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
});

// Leave a clan
router.post('/leave', async (req, res) => {
  try {
    const {clan, token} = await ClansService.leaveClan(req.body);
    res.status(200).json({clan, token, message: 'Left clan successfully' }); 
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get clan details
router.get('/details', async (req, res) => {
  try {
    const {clanInfo} = await ClansService.getClanDetails(req.body);
    res.status(200).json({clanInfo, message: 'Success get info clan' }); 
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;