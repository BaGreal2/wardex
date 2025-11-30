// src/server.ts
import "dotenv/config";

import fs from "node:fs";
import https from "node:https";

import { buildApp } from "./app";

const app = buildApp();
const port = Number(process.env.PORT ?? 3443);

const DOMAIN = "wardex-vm.switzerlandnorth.cloudapp.azure.com";

const key = fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/privkey.pem`);
const cert = fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/fullchain.pem`);

const server = https.createServer({ key, cert }, app.server as any);

server.listen(port, "0.0.0.0", () => {
  app.log.info(`Server listening at https://0.0.0.0:${port}`);
});
