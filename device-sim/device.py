import os
import ssl
import random
import paho.mqtt.client as mqtt
from dotenv import load_dotenv
from time import sleep, time

load_dotenv()

HUB_NAME = os.getenv("HUB_NAME")
DEVICE_ID = os.getenv("DEVICE_ID")
DEVICE_KEY = os.getenv("DEVICE_KEY")

USERNAME = f"{HUB_NAME}.azure-devices.net/{DEVICE_ID}/?api-version=2021-04-12"
BROKER = f"{HUB_NAME}.azure-devices.net"
TOPIC = f"devices/{DEVICE_ID}/messages/events/"

client = mqtt.Client(client_id=DEVICE_ID, protocol=mqtt.MQTTv311)
client.username_pw_set(USERNAME, DEVICE_KEY)
client.tls_set_context(ssl.create_default_context())

client.connect(BROKER, 8883)
client.loop_start()

state = "close"
last_heartbeat = time()
HEARTBEAT_INTERVAL = 600

battery = 100.0
BATTERY_DRAIN_PER_STATE_CHANGE = 0.05
BATTERY_DRAIN_PER_HEARTBEAT = 0.01

try:
    while True:
        if random.random() < 0.1:
            state = "open" if state == "close" else "close"
            battery = max(0, battery - BATTERY_DRAIN_PER_STATE_CHANGE)

            payload = (
                f'{{"door": "{state}", "battery": {battery:.2f}, "ts": {int(time())}}}'
            )
            client.publish(TOPIC, payload, qos=1)
            print("STATE:", payload)

        if time() - last_heartbeat > HEARTBEAT_INTERVAL:
            battery = max(0, battery - BATTERY_DRAIN_PER_HEARTBEAT)

            payload = (
                f'{{"heartbeat": true, "battery": {battery:.2f}, "ts": {int(time())}}}'
            )
            client.publish(TOPIC, payload, qos=1)
            print("HEARTBEAT:", payload)

            last_heartbeat = time()

        sleep(1)

except KeyboardInterrupt:
    print("Stopping...")
    client.loop_stop()
    client.disconnect()
