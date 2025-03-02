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
    const responseTopic = `${serial_number}/pair/res`;
    const payload = JSON.stringify({
        name,
    });

    try {
        // Ensure client is connected
        if (!mqttClient.connected) {
            return res.status(500).json({ error: 'MQTT client not connected' });
        }

        // Subscribe to the response topic before publishing the request
        mqttClient.subscribe(responseTopic, (err) => {
            if (err) {
                console.error(`Subscription error: ${err.message}`);
                return res.status(500).json({ error: 'Failed to subscribe to response topic' });
            }
        });

        // Publish pairing request
        mqttClient.publish(topic, payload);

        // Wait for response with a timeout of 30 seconds
        const response = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Device response timed out'));
            }, 30000);

            // Use once for the 'message' event and filter by topic
            mqttClient.once('message', (receivedTopic, message) => {
                if (receivedTopic === responseTopic) {
                    clearTimeout(timeout);
                    try {
                        const data = JSON.parse(message.toString());
                        console.log('Received response:', data);

                        // Unsubscribe after the response is processed
                        mqttClient.unsubscribe(responseTopic, (err) => {
                            if (err) {
                                console.error(`Unsubscribe error: ${err.message}`);
                            }
                        });

                        resolve(data);
                    } catch (error) {
                        reject(new Error('Invalid message format'));
                    }
                }
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

// Get a device by device id
router.get('/:device_id', async (req, res) => {
    const { device_id } = req.params;
    try {
        const device = await db.getDeviceById(device_id);
        if (device) {
            res.json(device);
        } else {
            res.status(404).send('Device not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting device');
    }
});

// Remove a device
router.delete('/:device_id', async (req, res) => {
    const { device_id } = req.params;

    const device = await db.getDeviceById(device_id);
    if (!device) {
        return res.status(404).json({ error: 'Device not found' });
    }

    const { serial_number } = device;
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

        const success = await db.removeDevice(device_id);
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

// Share a device with specified user
router.post('/:device_id/share', async(req, res) => {
    const { device_id } = req.params;
    const { owner_id, user_id, access_level } = req.body;

    if (!owner_id || !user_id || !access_level) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await db.getDeviceById(device_id);
    if (!device) {
        return res.status(404).json({ error: 'Device not found' });
    }

    if (owner_id != device.owner_id) {
        return res.status(403).json({ error: 'Only the owner can manage access'});
    }
    
    try {
        const shared_device = await db.addSharedDevice(owner_id, user_id, device_id, access_level);
        if (shared_device) {
            res.status(201).json(shared_device);
        } else {
            res.status(400).json({ error: 'Error sharing device'});
        }
    } catch (error) {
        confirm.error(error);
        res.status(500).json({ error: 'Error sharing device'});
    }
});

// Stop sharing a device
router.delete(':device_id/share', async(req, res) => {
    const { device_id } = req.params;
    const { user_id } = req.body;

    try {
        const success = await db.removeSharedDevice(user_id, device_id);
        if (success) {
            res.status(200).send('Device is not shared anymore');
        } else {
            res.status(404).send('Error removing shared device');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error removing shared device');
    }
});

// Get device sharing info
router.get(':device_id/share', async(req, res) => {
    const { device_id } = req.params

    try {
        const sharing_info = await db.getSharingInfoByDeviceId(device_id);
        if (sharing_info) {
            res.status(200).json(sharing_info);
        } else {
            res.status(400).json({ error: `Error getting sharing info for device ${device_id}` });
        } 
    } catch (error) {
        console.error(error);
        res.status(500).send(`Error getting sharing info for device ${device_id}`);
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
    const responseTopic = `${serial_number}/status/res`;
    const payload = '';

    try {
        // Ensure client is connected
        if (!mqttClient.connected) {
            return res.status(500).json({ error: 'MQTT client not connected' });
        }

        // Subscribe to the response topic before publishing the request
        mqttClient.subscribe(responseTopic, (err) => {
            if (err) {
                console.error(`Subscription error: ${err.message}`);
                return res.status(500).json({ error: 'Failed to subscribe to response topic' });
            }
        });

        // Publish pairing request
        mqttClient.publish(topic, payload);

        // Wait for response with a timeout of 30 seconds
        const response = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Device status response timed out'));
            }, 1000);

            // Use once for the 'message' event and filter by topic
            mqttClient.once('message', (receivedTopic, message) => {
                if (receivedTopic === responseTopic) {
                    clearTimeout(timeout);
                    try {
                        const data = JSON.parse(message.toString());
                        console.log('Received response:', data);

                        // Unsubscribe after the response is processed
                        mqttClient.unsubscribe(responseTopic, (err) => {
                            if (err) {
                                console.error(`Unsubscribe error: ${err.message}`);
                            }
                        });

                        resolve(data);
                    } catch (error) {
                        reject(new Error('Invalid message format'));
                    }
                }
            });
        });

        if (response.status === 'Ok') {
            return res.status(201).json(response);
        } else {
            return res.status(400).json({ error: response.message });
        }
    } catch (error) {
        console.error(`Error getting device status: ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;