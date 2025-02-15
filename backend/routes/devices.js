const express = require('express');
const router = express.Router();
const db = require('../services/database');
const mqttClient = require('../services/mqtt');

// Add a new device
router.post('', async (req, res) => {
    const { serial_number, name, user_id } = req.body;

    if (!serial_number || !name || !user_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const topic = `${serial_number}/pair/req`;
    const payload = JSON.stringify({
        name,
    });

    try {
        // Publish pairing request
        mqttClient.publish(topic, payload);

        // Wait for response with a timeout of 30 seconds
        const response = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Device response timed out'));
            }, 30000);

            mqttClient.once(`${serial_number}/pair/res`, (message) => {
                clearTimeout(timeout);
                const data = JSON.parse(message.toString());
                resolve(data);
            });
        });

        if (response.status === 'accepted') {
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
    const topic = `${serial_number}/unpair/req`;
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
    const topic = `${serial_number}/start/${type}/req`;
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
    const topic = `${serial_number}/stop/req`;
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
router.post('/:device_id/set/:setting_name', async (req, res) => {
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
    const topic = `${serial_number}/set/${setting_name}/req`;
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
router.post('/:device_id/cmd/:direction', async (req, res) => {
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
    const topic = `${serial_number}/cmd/${direction}/req`;
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

// Send update command to a device
router.post('/:device_id/cmd/update', async (req, res) => {
    const { device_id } = req.params

    if (!device_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await db.getDeviceById(device_id);
    if (!device) {
        return res.status(404).send("Device not found");
    }

    const { serial_number } = device;
    const topic = `${serial_number}/cmd/update/req`;
    const payload = '';

    try {
        mqttClient.publish(topic, payload);
        return res.status(201).send("Request sent to the device");
    } catch (error) {
        return res.status(500).send("Error sending request to the device");
    }
});

// Get device status
router.get('/:device_id/status', async (req, res) => {
    const { device_id } = req.params;

    if (!device_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await db.getDeviceById(device_id);
    if (!device) {
        return res.status(404).send("Device not found");
    }

    const { serial_number } = device;
    const topic = `${serial_number}/status/req`;
    const payload = JSON.stringify(req.body);
    
});

module.exports = router;