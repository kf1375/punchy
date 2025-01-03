const mqtt = require('mqtt');
const { MQTT_BROKER, MQTT_PORT } = process.env; // Ensure these are set in your environment variables

class MqttClient {
    #mqttClientId = 'telegram-bot';
    #host = MQTT_BROKER;
    #port = MQTT_PORT;
    #reconnectIntervalSecond = 5;

    #mqttClient = null;
    #callbacks = {};

    constructor() {
        // Constructor logic
    }

    async publish(topic, payload) {
        if (!this.#mqttClient) {
            await this.#createMqttClient();
        }

        if (typeof payload === 'object') {
            payload = JSON.stringify(payload);
        }

        this.#mqttClient.publish(topic, payload, (err) => {
            if (err) {
                console.error('Error publishing message:', err);
            }
        });
    }

    async subscribe(topic, callback) {
        if (!this.#callbacks[topic]) {
            this.#callbacks[topic] = [];
        }

        if (!this.#callbacks[topic].includes(callback)) {
            this.#callbacks[topic].push(callback);
        }

        if (!this.#mqttClient) {
            await this.#createMqttClient();
        }

        this.#mqttClient.subscribe(topic, (err) => {
            if (err) {
                console.error('Error subscribing to topic:', err);
            }
        });
    }

    async cancelCallback(topic = null, callback = null) {
        if (!topic && !callback) {
            throw new Error('Must specify either topic, callback, or both');
        }

        if (topic && callback) {
            this.#callbacks[topic] = this.#callbacks[topic].filter(cb => cb !== callback);
        } else if (topic) {
            delete this.#callbacks[topic];
        } else {
            Object.keys(this.#callbacks).forEach(t => {
                this.#callbacks[t] = this.#callbacks[t].filter(cb => cb !== callback);
            });
        }

        if (Object.keys(this.#callbacks).length === 0 && this.#mqttClient) {
            await this.#stopMqttClient();
        }
    }

    async #createMqttClient() {
        this.#mqttClient = mqtt.connect(`mqtt://${this.#host}:${this.#port}`, {
            clientId: this.#mqttClientId,
            reconnectPeriod: this.#reconnectIntervalSecond * 1000,
        });

        this.#mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');
        });

        this.#mqttClient.on('error', (err) => {
            console.error('MQTT Client Error:', err);
        });

        this.#mqttClient.on('message', async (topic, payload) => {
            await this.#handleMessage(topic, payload);
        });
    }

    async #stopMqttClient() {
        if (this.#mqttClient) {
            this.#mqttClient.end();
            this.#mqttClient = null;
            console.log('MQTT client stopped');
        }
    }

    async #handleMessage(topic, payload) {
        for (let [subscribedTopic, callbacks] of Object.entries(this.#callbacks)) {
            if (this.#matchTopic(topic, subscribedTopic)) {
                for (let callback of callbacks) {
                    await callback(topic, payload.toString());
                }
            }
        }
    }

    #matchTopic(topic, subscribedTopic) {
        const regex = new RegExp(subscribedTopic.replace('#', '.*').replace('+', '[^/]+'));
        return regex.test(topic);
    }
}

const mqttClient = new MqttClient();

module.exports = mqttClient;
