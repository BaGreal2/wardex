import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export default fp(async function jwtPlugin(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  });

  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.unauthorized();
    }
  });
});
