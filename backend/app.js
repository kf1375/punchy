const express = require('express');
const app = express();
const db = require('./services/database');  // Import the db.js file
const port = 8000;

app.use(express.json());

// Check if a user exists by Telegram ID
app.get('/users/exists/:telegram_id', async (req, res) => {
    const { telegram_id } = req.params;
    try {
        const exists = await db.userExists(telegram_id);
        res.json({ exists });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error checking if user exists');
    }
});

// Add a new user
app.post('/users', async (req, res) => {
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
app.delete('/users/:telegram_id', async (req, res) => {
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
app.get('/users/:telegram_id', async (req, res) => {
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
app.get('/users/:user_id/devices', async (req, res) => {
    const { user_id } = req.params;
    try {
        const devices = await db.getUserDevices(user_id);
        res.json(devices);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching user devices');
    }
});

// Check if a device exists
app.get('/devices/exists/:serial_number', async (req, res) => {
    const { serial_number } = req.params;
    try {
        const exists = await db.deviceExists(serial_number);
        res.json({ exists });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error checking if device exists');
    }
});

// Add a new device
app.post('/devices', async (req, res) => {
    const { serial_number, name, user_id } = req.body;
    try {
        const newDevice = await db.addDevice(serial_number, name, user_id);
        res.status(201).json(newDevice);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding device');
    }
});

// Remove a device
app.delete('/devices/:serial_number', async (req, res) => {
    const { serial_number } = req.params;
    try {
        const success = await db.removeDevice(serial_number);
        if (success) {
            res.status(200).send('Device removed');
        } else {
            res.status(404).send('Device not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error removing device');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
