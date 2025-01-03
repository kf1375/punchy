const express = require('express');
const app = express();
const db = require('./services/database');  // Import the db.js file
const mqtt = require('mqtt');
const { MQTT_URL } = process.env;
const mqttClient = mqtt.connect(MQTT_URL);
const port = 8000;

app.use(express.json());

// Store temporary state for pairing responses
const pendingPairings = new Map();

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

    if (!serial_number || !name || !user_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const topic = `${serial_number}/pair`;
    const payload = JSON.stringify({
        type: 'request',
        device_name,
    });

    try {
        // Publish pairing request
        client.publish(topic, payload);

        // Wait for response with a timeout of 30 seconds
        const response = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                pendingPairings.delete(serial_number);
                reject(new Error('Device response timed out'));
            }, 30000);

            // Store callback for response handling
            pendingPairings.set(serial_number, (data) => {
                clearTimeout(timeout);
                resolve(data);
            });
        });

        if (response.status === 'accepted') {
            // Add device to database
            const newDevice = await db.addDevice(serial_number, device_name, user_id);
            return res.status(201).json(newDevice);
        } else {
            return res.status(400).json({ error: response.message });
        }
    } catch (error) {
        console.error(`Error pairing device: ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
});

// Listen for device responses
mqttClient.on('message', (topic, message) => {
    const [serial_number, action] = topic.split('/');

    if (action === 'pair') {
        const response = JSON.parse(message.toString());

        if (response.type === 'response') {
            // Call the stored callback with the response data
            const callback = pendingPairings.get(serial_number);
            if (callback) {
                callback(response);
                pendingPairings.delete(serial_number);
            }
        }
    }
});

// Subscribe to all pairing topics
mqttClient.on('connect', () => {
    mqttClient.subscribe('#/pair'); // Listen to all pairing topics
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
