import os
import sys
import ssl
import random
import base64
import hmac
import hashlib
import urllib.parse
import json
from time import sleep, time
from typing import Optional

import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()

HUB_NAME = os.getenv("HUB_NAME")
DEVICE_ID = os.getenv("DEVICE_ID")
DEVICE_KEY = os.getenv("DEVICE_KEY")

cli_device_id = sys.argv[1] if len(sys.argv) > 1 else None
cli_device_key = sys.argv[2] if len(sys.argv) > 2 else None

if cli_device_id:
    DEVICE_ID = cli_device_id

if cli_device_key:
    DEVICE_KEY = cli_device_key

if not DEVICE_ID:
    raise RuntimeError("DEVICE_ID must be set via env or CLI")

if not DEVICE_KEY:
    raise RuntimeError("DEVICE_KEY must be set via env or CLI")

USERNAME = f"{HUB_NAME}.azure-devices.net/{DEVICE_ID}/?api-version=2021-04-12"
BROKER = f"{HUB_NAME}.azure-devices.net"
D2C_TOPIC = f"devices/{DEVICE_ID}/messages/events/"
C2D_TOPIC_FILTER = f"devices/{DEVICE_ID}/messages/devicebound/#"


def make_sas_token(uri: str, key: Optional[str], ttl: int = 3600) -> str:
    if key is None:
        raise ValueError("Key cannot be None")

    expiry = int(time()) + ttl
    uri_enc = urllib.parse.quote_plus(uri)
    sign_data = f"{uri_enc}\n{expiry}".encode("utf-8")
    decoded_key = base64.b64decode(key)
    sig = hmac.new(decoded_key, sign_data, hashlib.sha256).digest()
    sig_enc = urllib.parse.quote_plus(base64.b64encode(sig))
    return f"SharedAccessSignature sr={uri_enc}&sig={sig_enc}&se={expiry}"


RESOURCE_URI = f"{HUB_NAME}.azure-devices.net/devices/{DEVICE_ID}"
SAS_TOKEN = make_sas_token(RESOURCE_URI, DEVICE_KEY)

alarm_enabled = False


def on_connect(client, userdata, flags, rc, properties=None):
    print("MQTT connect rc:", rc)
    if rc == 0:
        client.subscribe(C2D_TOPIC_FILTER, qos=1)
        print("Subscribed to C2D:", C2D_TOPIC_FILTER)


def on_message(client, userdata, msg):
    global alarm_enabled
    try:
        payload = msg.payload.decode("utf-8")
        data = json.loads(payload)
    except Exception:
        print("C2D raw message:", msg.payload)
        return

    if "alarm" in data:
        alarm_enabled = bool(data["alarm"])
        print(f"C2D alarm command -> {'ON' if alarm_enabled else 'OFF'}")
    else:
        print("C2D message:", data)


client = mqtt.Client(client_id=DEVICE_ID, protocol=mqtt.MQTTv311)
client.on_connect = on_connect
client.on_message = on_message
client.username_pw_set(USERNAME, SAS_TOKEN)
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
            payload = {
                "door": state,
                "battery": round(battery, 2),
                "ts": int(time()),
                "alarmEnabled": alarm_enabled,
            }
            client.publish(D2C_TOPIC, json.dumps(payload), qos=1)
            print("STATE:", payload)
            if state == "open" and alarm_enabled:
                print(">>> ALARM TRIGGERED! <<<")

        if time() - last_heartbeat > HEARTBEAT_INTERVAL:
            battery = max(0, battery - BATTERY_DRAIN_PER_HEARTBEAT)
            payload = {
                "heartbeat": True,
                "battery": round(battery, 2),
                "ts": int(time()),
                "alarmEnabled": alarm_enabled,
            }
            client.publish(D2C_TOPIC, json.dumps(payload), qos=1)
            print("HEARTBEAT:", payload)
            last_heartbeat = time()

        sleep(1)

except KeyboardInterrupt:
    print("\nStopping...")
    client.loop_stop()
    client.disconnect()
