import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { sql } from "drizzle-orm";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        tags: ["system"],
        response: {
          200: Type.Object({
            ok: Type.Boolean(),
            db: Type.String(),
          }),
        },
      },
    },
    async () => {
      try {
        await fastify.db.execute(sql`SELECT 1`);
        return { ok: true, db: "up" };
      } catch (err) {
        fastify.log.error({ err }, "DB health check failed");
        throw fastify.httpErrors.internalServerError("DB health check failed");
      }
    },
  );
};

export default plugin;
