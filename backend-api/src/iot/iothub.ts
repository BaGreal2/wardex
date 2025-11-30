import crypto from "node:crypto";

type ParsedConnectionString = {
  hostName: string;
  keyName: string;
  key: string;
};

function parseConnectionString(cs: string): ParsedConnectionString {
  const parts = Object.fromEntries(
    cs.split(";").map((p) => {
      const [k, v] = p.split("=");
      return [k, v];
    }),
  );

  const hostName = parts.HostName;
  const keyName = parts.SharedAccessKeyName;
  const key = parts.SharedAccessKey;

  if (!hostName || !keyName || !key) {
    throw new Error("Invalid IOTHUB_SERVICE_CONNECTION_STRING");
  }

  return { hostName, keyName, key };
}

const connStr = process.env.IOTHUB_SERVICE_CONNECTION_STRING;
if (!connStr) {
  throw new Error("IOTHUB_SERVICE_CONNECTION_STRING is not set");
}

const { hostName, keyName, key } = parseConnectionString(connStr);

function buildSasToken(resourceUri: string, keyName: string, key: string, ttlSeconds = 3600) {
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;

  const encodedUri = encodeURIComponent(resourceUri.toLowerCase());
  const hmac = crypto.createHmac("sha256", Buffer.from(key, "base64"));
  hmac.update(`${encodedUri}\n${expiry}`);
  const signature = encodeURIComponent(hmac.digest("base64"));

  return `SharedAccessSignature sr=${encodedUri}&sig=${signature}&se=${expiry}&skn=${keyName}`;
}

export async function sendAlarmCommandToDevice(iotDeviceId: string, alarmOn: boolean) {
  const resourceUri = `${hostName}/devices/${iotDeviceId}`;
  const sasToken = buildSasToken(resourceUri, keyName, key);

  const url = `https://${hostName}/devices/${encodeURIComponent(
    iotDeviceId,
  )}/messages/devicebound?api-version=2021-04-12`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: sasToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ alarm: alarmOn }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IoT Hub C2D send failed (${res.status}): ${text}`);
  }
}
