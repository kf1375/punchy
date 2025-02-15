const express = require('express');
const router = express.Router();
const db = require('../services/database');
const { mqttClient, pendingPairings } = require('../services/mqtt');

// Start a device
router.post('/:device_id/start/:type', async (req, res) => {
    const { device_id, type } = req.params;
    const { speed } = req.body;

    if (!device_id || !type || !speed) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await db.getDeviceById(device_id);
    if (!device) {
        return res.status(404).send("Device not found");
    }

    const { serial_number } = device;
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
router.post('/:device_id/stop', async (req, res) => {
    const { device_id } = req.params;

    if (!device_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await db.getDeviceById(device_id)
    if (!device) {
        return res.status(404).send("Device not found");
    }
    
    const { serial_number } = device;
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
router.post('/:device_id/settings/:setting_name', async (req, res) => {
    const { device_id, setting_name } = req.params;
    const { value } = req.body;

    if (!device_id || !setting_name || !value) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await db.getDeviceById(device_id);
    if (!device) {
        return res.status(404).send("Device not found");
    }

    const { serial_number } = device;
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
router.post('/:device_id/commands/:direction', async (req, res) => {
    const { device_id, direction } = req.params;
    const { value } = req.body;

    if (!device_id || !direction || !value) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await db.getDeviceById(device_id);
    if (!device) {
        return res.status(404).send("Device not found");
    }

    const { serial_number } = device;
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
router.post('', async (req, res) => {
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

// Remove a device
router.delete('/:serial_number', async (req, res) => {
    const { serial_number } = req.params;

    // Define the unpair topic and payload
    const topic = `${serial_number}/unpair`;
    const payload = JSON.stringify({
        type: 'unpair',
    });

    try {
        // Publish the unpair message with QoS 2
        await new Promise((resolve, reject) => {
            mqttClient.publish(topic, payload, { qos: 2 }, (err) => {
                if (err) {
                    reject(new Error(`Failed to publish unpair message: ${err.message}`));
                } else {
                    resolve();
                }
            });
        });

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

module.exports = router;