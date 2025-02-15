const mqtt = require('mqtt');
const { MQTT_URL } = process.env;
const mqttClient = mqtt.connect(MQTT_URL);

module.exports = mqttClient;