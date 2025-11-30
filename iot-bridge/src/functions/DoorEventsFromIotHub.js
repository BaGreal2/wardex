const { app } = require("@azure/functions");

const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ?? "http://localhost:3000";
const EVENT_HUB_NAME = process.env.EVENT_HUB_NAME;

app.eventHub("DoorEventsFromIotHub", {
  connection: "IotHubEventHubConnection",
  eventHubName: EVENT_HUB_NAME,
  consumerGroup: "wardex-backend",
  cardinality: "many",

  handler: async (messages, context) => {
    const arr = Array.isArray(messages) ? messages : [messages];
    const sysArray = context.triggerMetadata?.systemPropertiesArray || [];

    for (let i = 0; i < arr.length; i++) {
      let msg = arr[i];
      const sys = sysArray[i] || {};

      const iotDeviceId = sys["iothub-connection-device-id"];
      if (!iotDeviceId) {
        context.log.warn("No iothub-connection-device-id, skipping message.");
        continue;
      }

      let body = msg;
      if (typeof msg === "string") {
        try {
          body = JSON.parse(msg);
        } catch (e) {
          context.log.warn("Failed to parse message JSON:", msg);
          continue;
        }
      }

      if (!body.door && body.heartbeat !== true) {
        context.log(
          `Skipping non-door message from ${iotDeviceId}: ${JSON.stringify(body)}`,
        );
        continue;
      }

      const payload = {
        door: body.door || "close",
        battery: body.battery ?? 0,
        alarmEnabled: body.alarmEnabled ?? null,
        ts: body.ts ?? Math.floor(Date.now() / 1000),
      };

      const url = `${BACKEND_BASE_URL}/api/devices/${iotDeviceId}/events/ingest`;
      context.log(`Forwarding event from ${iotDeviceId} to ${url}`, payload);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text();
          context.log.error(
            `Backend ingest failed (${res.status}) for ${backendDeviceId}: ${text}`,
          );
        } else {
          context.log(`Ingest OK for device ${backendDeviceId}`);
        }
      } catch (err) {
        context.log.error("Error calling backend:", err);
      }
    }
  },
});

