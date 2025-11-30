import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import AutoLoad from "@fastify/autoload";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify, { type FastifyServerOptions } from "fastify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function buildApp(opts: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: true,
    ...opts,
  }).withTypeProvider<TypeBoxTypeProvider>();

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
