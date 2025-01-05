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

// Start a device
app.post('/devices/:device_id/start/:type', async (req, res) => {
    const { device_id, type } = req.params;
    const { speed } = req.body;

    if (!device_id || !type || !speed) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = db.getDeviceById(device_id);
    if (!device) {
        return res.status(404).send("Device not found");
    }

    const serial_number = device["serial_number"];
    const topic = `${serial_number}/start/${type}`;
    const payload = JSON.stringify({
        speed: speed
    });

    try {
        mqttClient.publish(topic, payload);
        return res.status(201).send("Request sent to the device");
    } catch (error) {
        return res.status(500).send("Error sending request to the device");
    }
});

// Stop a device
app.post('/devices/:device_id/stop', async (req, res) => {
    const { device_id } = req.params;

    if (!device_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = db.getDeviceById(device_id)
    if (!device) {
        return res.status(404).send("Device not found");
    }
    
    console.log(device);
    
    const serial_number = device["serial_number"];
    const topic = `${serial_number}/stop`;
    const payload = JSON.stringify({
        speed: 0
    });

    try {
        mqttClient.publish(topic, payload);
        return res.status(201).send("Request sent to the device");
    } catch (error) {
        return res.status(500).send("Error sending request to the device");
    }
});

// Set a new setting
app.post('/devices/:device_id/settings/:setting_name', async (req, res) => {
    const { device_id, setting_name } = req.params;
    const { value } = req.body;

    if (!device_id || !setting_name || !value) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = db.getDeviceById(device_id);
    if (!device) {
        return res.status(404).send("Device not found");
    }

    const serial_number = device["serial_number"];
    const topic = `${serial_number}/settings/${setting_name}`;
    const payload = JSON.stringify({
        value: value
    });

    try {
        mqttClient.publish(topic, payload);
        return res.status(201).send("Request sent to the device");
    } catch (error) {
        return res.status(500).send("Error sending request to the device");
    }
});

// Set a new manual command
app.post('/devices/:device_id/commands/:direction', async (req, res) => {
    const { device_id, direction } = req.params;
    const { value } = req.body;

    if (!device_id || !direction || !value) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = db.getDeviceById(device_id);
    if (!device) {
        return res.status(404).send("Device not found");
    }

    const serial_number = device["serial_number"];
    const topic = `${serial_number}/commands/${direction}`;
    const payload = JSON.stringify({
        value: value
    });

    try {
        mqttClient.publish(topic, payload);
        return res.status(201).send("Request sent to the device");
    } catch (error) {
        return res.status(500).send("Error sending request to the device");
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
        name,
    });

    try {
        // Publish pairing request
        mqttClient.publish(topic, payload);

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
            const newDevice = await db.addDevice(serial_number, name, user_id);
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
    mqttClient.subscribe('#'); // Listen to all pairing topics
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
