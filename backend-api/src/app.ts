import type { ServerOptions as HttpsServerOptions } from "node:https";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import AutoLoad from "@fastify/autoload";
import fastifyCors from "@fastify/cors";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify, { type FastifyServerOptions } from "fastify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function buildApp(https?: HttpsServerOptions) {
  const serverOptions: FastifyServerOptions = {
    logger: true,
    ...(https ? { https } : {}),
  };

  const app = Fastify(serverOptions).withTypeProvider<TypeBoxTypeProvider>();

  app.register(fastifyCors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      const allowed = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://wardex-vm.switzerlandnorth.cloudapp.azure.com",
      ];

      if (allowed.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
  });

  app.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: { prefix: "/api" },
    dirNameRoutePrefix: true,
    routeParams: true,
  });

  return app;
}
