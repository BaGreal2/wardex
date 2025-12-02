#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <time.h>
#include <base64.h>
#include <mbedtls/md.h>
#include <mbedtls/sha256.h>
#include <mbedtls/base64.h>

const char* ssid = "Wokwi-GUEST";
const char* password = "";

const char* iotHubHost = "WardexSecurityHub.azure-devices.net";
const char* deviceId = "8750c37c-16ff-4b70-8c94-f7c383c69476";
const char* deviceKey = "2WgGWxE/TxaK9r1TQSLWDZmubQqc1bBsFSFUuICBzZ4=";

const int mqttPort = 8883; 

const int LIGHT_PIN = 34;    
const int ALARM_LED = 2;     
const int BUZZER_PIN = 14;   

WiFiClientSecure espClient;
PubSubClient client(espClient);

int baseline = 0;
int thresholdVal = 0;
const int CALIB_SAMPLES = 40;
const int DELTA = 120;       
const int SMOOTHING = 4;
int smoothVal = 0;

bool alarmEnabled = false;
bool beamBroken = false;
float battery = 100.0f;
unsigned long lastHeartbeat = 0;
const unsigned long HEARTBEAT_INTERVAL_MS = 600000UL; 

unsigned long lastDebounce = 0;
const unsigned long DEBOUNCE_MS = 80;

String getTelemetryTopic() { return "devices/" + String(deviceId) + "/messages/events/"; }
String getC2DTopic() { return "devices/" + String(deviceId) + "/messages/devicebound/#"; }

String generateSASToken(String host, String deviceId, String key, int expiryDurationInSeconds = 3600) {
  unsigned long now = time(nullptr);
  unsigned long expiry = now + expiryDurationInSeconds;
  
  String uri = host + "%2Fdevices%2F" + deviceId;
  String stringToSign = uri + "\n" + String(expiry);
  
  int keyLen = key.length();
  byte decodedKey[keyLen];
  size_t decodedLen = 0;
  
  mbedtls_base64_decode(decodedKey, keyLen, &decodedLen, (const unsigned char*)key.c_str(), keyLen);

  byte signature[32];
  mbedtls_md_context_t ctx;
  mbedtls_md_type_t md_type = MBEDTLS_MD_SHA256;
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(md_type), 1);
  mbedtls_md_hmac_starts(&ctx, decodedKey, decodedLen);
  mbedtls_md_hmac_update(&ctx, (const unsigned char*)stringToSign.c_str(), stringToSign.length());
  mbedtls_md_hmac_finish(&ctx, signature);
  mbedtls_md_free(&ctx);

  String encodedSignature = base64::encode(signature, 32);
  
  String urlEncodedSignature = "";
  for (int i = 0; i < encodedSignature.length(); i++) {
    char c = encodedSignature[i];
    if (isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~') {
      urlEncodedSignature += c;
    } else {
      urlEncodedSignature += '%' + String(c, HEX);
    }
  }
  
  return "SharedAccessSignature sr=" + uri + "&sig=" + urlEncodedSignature + "&se=" + String(expiry);
}

void publishPayload(bool isHeartbeat = false) {
  unsigned long ts = time(nullptr);
  String payload = "{";
  if (isHeartbeat) payload += "\"heartbeat\":true,";
  payload += "\"door\":\"";
  payload += (beamBroken ? "open" : "close");
  payload += "\",";
  payload += "\"battery\":";
  payload += String(battery, 2);
  payload += ",";
  payload += "\"ts\":";
  payload += String(ts);
  payload += ",";
  payload += "\"alarmEnabled\":";
  payload += (alarmEnabled ? "true" : "false");
  payload += "}";
  
  if(client.publish(getTelemetryTopic().c_str(), payload.c_str())) {
     Serial.println("PUB: " + payload);
  } else {
     Serial.println("PUB FAILED");
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];
  Serial.println("RX [" + String(topic) + "]: " + msg);

  if (msg.indexOf("alarm") >= 0) {
    if (msg.indexOf("true") >= 0 || msg.indexOf("1") >= 0 || msg.indexOf("on") >= 0) alarmEnabled = true;
    else alarmEnabled = false;
    Serial.println("Alarm state set to: " + String(alarmEnabled ? "ON" : "OFF"));
  }
}

void connectToAzure() {
  while (!client.connected()) {
    Serial.print("Connecting to Azure IoT Hub...");
    
    if (time(nullptr) < 1000000000) {
       Serial.println("Time not synced yet. Waiting...");
       delay(1000);
       return;
    }

    String sasToken = generateSASToken(iotHubHost, deviceId, deviceKey);
    String username = String(iotHubHost) + "/" + String(deviceId) + "/?api-version=2018-06-30";

    if (client.connect(deviceId, username.c_str(), sasToken.c_str())) {
      Serial.println(" connected!");
      client.subscribe(getC2DTopic().c_str());
    } else {
      Serial.print(" failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5s");
      delay(5000);
    }
  }
}

int readSmoothedLight() {
  int raw = analogRead(LIGHT_PIN);
  smoothVal = (smoothVal * (SMOOTHING - 1) + raw) / SMOOTHING;
  return smoothVal;
}

void calibrateBaseline() {
  Serial.println("Calibrating... Ensure beam is CONNECTED (High light value)");
  long sum = 0;
  for (int i = 0; i < CALIB_SAMPLES; ++i) {
    sum += analogRead(LIGHT_PIN);
    delay(50);
  }
  baseline = sum / CALIB_SAMPLES;
  thresholdVal = max(0, baseline - DELTA);
  smoothVal = baseline;
  Serial.println("Baseline: " + String(baseline) + " Threshold: " + String(thresholdVal));
}

void setup() {
  Serial.begin(115200);
  pinMode(ALARM_LED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("Waiting for NTP time");
  while (time(nullptr) < 1000000000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nTime synced!");

  espClient.setInsecure();
  client.setServer(iotHubHost, mqttPort);
  client.setCallback(mqttCallback);
  
  client.setBufferSize(2048); 

  delay(500);
  calibrateBaseline();
  lastHeartbeat = millis();
}

void loop() {
  if (!client.connected()) connectToAzure();
  client.loop();

  unsigned long now = millis();
  int light = readSmoothedLight();

  bool currentBroken = (light < thresholdVal);
  
  if (currentBroken != beamBroken && (now - lastDebounce) > DEBOUNCE_MS) {
    lastDebounce = now;
    beamBroken = currentBroken;
    
    battery = max(0.0f, battery - 0.05f);
    publishPayload(false); 

    if (beamBroken && alarmEnabled) {
      digitalWrite(ALARM_LED, HIGH);
      digitalWrite(BUZZER_PIN, HIGH);
    } else {
      digitalWrite(ALARM_LED, LOW);
      digitalWrite(BUZZER_PIN, LOW);
    }
  }

  if (now - lastHeartbeat > HEARTBEAT_INTERVAL_MS) {
    publishPayload(true);
    lastHeartbeat = now;
  }
  
  delay(10);
}
