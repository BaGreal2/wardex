import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { db, type Db } from "@/db/client";

declare module "fastify" {
  interface FastifyInstance {
    db: Db;
  }
}

export default fp(async function dbPlugin(fastify: FastifyInstance) {
  fastify.decorate("db", db);
});
