const mqtt = require('mqtt');
const { MQTT_URL } = process.env;
const mqttClient = mqtt.connect(MQTT_URL);

// Store temporary state for pairing responses
const pendingPairings = new Map();

// Subscribe to all topics
mqttClient.on('connect', () => {
    mqttClient.subscribe('#');
});

// Listen for device responses
mqttClient.on('message', async (topic, message) => {
    const [serial_number, action] = topic.split('/');

    if (action === 'pair') {
        try {
            const response = JSON.parse(message.toString());

            if (response.type === 'response') {
                // Call the stored callback with the response data
                const callback = pendingPairings.get(serial_number);
                if (callback) {
                    callback(response);
                    pendingPairings.delete(serial_number);
                }
            }
        } catch (error) {
            console.error(`Error parsing device response: ${error.message}`);
        }
    } else if (action === 'status') {
        try {
            const response = JSON.parse(message.toString());
        
            if (response.type === 'request') {
                const device = await db.getDeviceBySerialNumber(serial_number);
                if (device) {
                    mqttClient.publish(topic, JSON.stringify({ 
                        type: "response", 
                        status: "existed" 
                    }));
                } else {
                    mqttClient.publish(topic, JSON.stringify({
                        type: "response", 
                        status: "not_existed"
                    }));
                }
            }
        } catch (error) {
            console.error(`Error parsing device status: ${error.message}`);
        }
    }
});

module.exports = { mqttClient, pendingPairings };