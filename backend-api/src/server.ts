import "dotenv/config";

import fs from "node:fs";

import type { FastifyServerOptions } from "fastify";

import { buildApp } from "./app";

const port = Number(process.env.PORT ?? 3000);
const useHttps = process.env.ENABLE_HTTPS === "1";

const httpsOpts = useHttps
  ? {
    https: {
      key: fs.readFileSync(process.env.TLS_KEY_PATH ?? "/etc/wardex/tls/key.pem", "utf8"),
      cert: fs.readFileSync(process.env.TLS_CERT_PATH ?? "/etc/wardex/tls/cert.pem", "utf8"),
    },
  }
  : {};

const app = buildApp(httpsOpts as FastifyServerOptions);

app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});

