import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type, type Static } from "@sinclair/typebox";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { users } from "@/db/schema";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const Body = Type.Object({
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 8 }),
  });

  type RegisterBody = Static<typeof Body>;

  const Response = Type.Object({
    token: Type.String(),
  });

  fastify.post<{ Body: RegisterBody }>(
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

      const existing = await fastify.db.select().from(users).where(eq(users.email, email)).limit(1);

      if (existing[0]) {
        return reply.conflict("User already exists");
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const displayName = email.split("@")[0] || "User";

      const inserted = await fastify.db
        .insert(users)
        .values({
          email,
          displayName,
          passwordHash: hash,
        })
        .returning();

      const user = inserted[0];
      if (!user) {
        throw fastify.httpErrors.internalServerError("Failed to create user");
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
