import "@fastify/jwt";
import "fastify";

import type { FastifyReply, FastifyRequest } from "fastify";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { userId: string; email: string };
    user: { userId: string; email: string };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorizeDeviceAccess: (deviceId: string, userId: string) => Promise<void>;
  }
}
