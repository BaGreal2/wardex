import crypto from "node:crypto";
import https from "node:https";

const connStr = process.env.IOTHUB_SERVICE_CONNECTION_STRING;
if (!connStr) throw new Error("IOTHUB_SERVICE_CONNECTION_STRING missing");

const parts = Object.fromEntries(
  connStr.split(";").map((kv) => {
    const [k, v] = kv.split("=");
    return [k, v];
  }),
);

const hostName = parts.HostName;
const keyName = parts.SharedAccessKeyName;
const key = parts.SharedAccessKey;

if (!hostName || !keyName || !key) {
  throw new Error("IOTHUB_SERVICE_CONNECTION_STRING does not look like an IoT Hub service string");
}

function buildSasToken(resourceUri: string, ttlSeconds = 3600): string {
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;
  const encodedUri = encodeURIComponent(resourceUri);
  const toSign = `${encodedUri}\n${expiry}`;
  const hmac = crypto.createHmac("sha256", Buffer.from(key, "base64"));
  hmac.update(toSign);
  const base64Sig = hmac.digest("base64");
  const encodedSig = encodeURIComponent(base64Sig);
  return `SharedAccessSignature sr=${encodedUri}&sig=${encodedSig}&se=${expiry}&skn=${keyName}`;
}

export async function ensureIotDevice(deviceId: string): Promise<{ primaryKey: string | null }> {
  const path = `/devices/${encodeURIComponent(deviceId)}?api-version=2021-04-12`;
  const resourceUri = `${hostName}${path}`;

  const sas = buildSasToken(resourceUri);

  const body = JSON.stringify({
    deviceId,
    status: "enabled",
  });

  return new Promise<{ primaryKey: string | null }>((resolve, reject) => {
    const req = https.request(
      {
        host: hostName,
        path,
        method: "PUT",
        headers: {
          Authorization: sas,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        if (res.statusCode === 409) {
          resolve({ primaryKey: null });
          return;
        }

        let chunks: Buffer[] = [];

        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            const text = Buffer.concat(chunks).toString("utf8");
            const json = JSON.parse(text);
            const primaryKey = json?.authentication?.symmetricKey?.primaryKey ?? null;
            resolve({ primaryKey });
          } else {
            const text = Buffer.concat(chunks).toString("utf8");
            reject(new Error(`IoT Hub registry failed (${res.statusCode}): ${text}`));
          }
        });
      },
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
