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
router.delete('/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const success = await db.removeUser(user_id);
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
router.get('', async (req, res) => {
    const { telegram_id, user_id } = req.query;
    console.log(telegram_id);
    let user;
    try {
        if (telegram_id) {
            console.log("TID: " + user_id);
            user = await db.getUserByTelegramId(telegram_id);
        } else if (user_id) {
            console.log("UID: " + user_id);
            user = await db.getUserByUserId(user_id)
        }
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
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

// Get shared devices of a user 
router.get('/:user_id/shared_devices', async (req, res) => {
    const { user_id } = req.params;
    try {
        const sharedDevices = await db.getUserSharedDevices(user_id);
        res.json(sharedDevices);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching user shared devices');
    }
});

module.exports = router;