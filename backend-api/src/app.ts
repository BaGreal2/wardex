import type { ServerOptions as HttpsServerOptions } from "node:https";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import AutoLoad from "@fastify/autoload";
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

  // plugins (db, swagger, etc.)
  app.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
  });

  // routes
  app.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: { prefix: "/api" },
    dirNameRoutePrefix: true,
    routeParams: true,
  });

  return app;
}
