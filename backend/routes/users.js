const express = require('express');
const router = express.Router();
const db = require('../services/database');

// Add a new user
router.post('', async (req, res) => {
    const { telegram_id, name, subscription_type } = req.body;
    try {
        const newUser = await db.addUser(telegram_id, name, subscription_type);
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding user');
    }
});

// Remove a user
router.delete('/:telegram_id', async (req, res) => {
    const { telegram_id } = req.params;
    try {
        const success = await db.removeUser(telegram_id);
        if (success) {
            res.status(200).send('User removed');
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error removing user');
    }
});

// Get a user by Telegram ID
router.get('/:telegram_id', async (req, res) => {
    const { telegram_id } = req.params;
    try {
        const user = await db.getUserByTelegramId(telegram_id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching user');
    }
});

// Get devices of a user
router.get('/:user_id/devices', async (req, res) => {
    const { user_id } = req.params;
    try {
        const devices = await db.getUserDevices(user_id);
        res.json(devices);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching user devices');
    }
});

module.exports = router;