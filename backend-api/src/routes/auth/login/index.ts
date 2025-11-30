import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type, type Static } from "@sinclair/typebox";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { users } from "@/db/schema";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const Body = Type.Object({
    email: Type.String({ format: "email" }),
    password: Type.String(),
  });

  type LoginBody = Static<typeof Body>;

  const Response = Type.Object({
    token: Type.String(),
  });

  fastify.post<{ Body: LoginBody }>(
    "/",
    {
      schema: {
        tags: ["auth"],
        body: Body,
        response: { 200: Response },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const rows = await fastify.db.select().from(users).where(eq(users.email, email)).limit(1);

      const user = rows[0];

      if (!user || !user.passwordHash) {
        return reply.unauthorized("Invalid email or password");
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return reply.unauthorized("Invalid email or password");
      }

      const token = fastify.jwt.sign({
        userId: user.id,
        email: user.email,
      });

      return reply.send({ token });
    },
  );
};

export default plugin;
