import asyncio
import aiomqtt

from config.settings import MQTT_BROKER, MQTT_PORT

class MqttClient:
    def __init__(self):
        self.broker = MQTT_BROKER
        self.port = MQTT_PORT
        self.client = aiomqtt.Client()
        self.connected = None

    async def connect(self):
        if not self.connected:
            try:
                await self.client.connect(self.broker, self.port)
                print(f"Connected to MQTT broker at {self.broker}:{self.port}")
                self.connected = True
            except Exception as e:
                print(f"Failed to connect to MQTT broker: {e}")
                raise

    async def disconnect(self):
        try:
            await self.client.disconnect()
            print("Disconnected from MQTT broker")
            self.connected = False
        except Exception as e:
            print(f"Failed to disconnect: {e}")

    async def publish(self, topic: str, payload: str):
        try:
            await self.client.publish(topic, payload)
            print(f"Message published to {topic}: {payload}")
        except Exception as e:
            print(f"Failed to publish message: {e}")

    async def subscribe(self, topic):
        await self.client.subscribe(topic)

    def messages(self):
        return self.client.messages

mqttClient = MqttClient()