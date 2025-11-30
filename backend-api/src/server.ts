// src/server.ts
import "dotenv/config";

import fs from "node:fs";

import { buildApp } from "./app";

const keyPath =
  process.env.TLS_KEY_PATH ??
  "/etc/letsencrypt/live/wardex-vm.switzerlandnorth.cloudapp.azure.com/privkey.pem";
const certPath =
  process.env.TLS_CERT_PATH ??
  "/etc/letsencrypt/live/wardex-vm.switzerlandnorth.cloudapp.azure.com/fullchain.pem";

const httpsOpts = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

const port = Number(process.env.PORT ?? 3443);

// Pass HTTPS options into app
const app = buildApp(httpsOpts);

app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});

