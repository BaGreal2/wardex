import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type, type Static } from "@sinclair/typebox";
import { desc, eq } from "drizzle-orm";

import { doorEvents } from "@/db/schema";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  const Params = Type.Object({
    deviceId: Type.String(),
  });
  type ParamsType = Static<typeof Params>;

  const DoorEvent = Type.Object({
    id: Type.Number(),
    doorState: Type.String(),
    battery: Type.Union([Type.Number(), Type.Null()]),
    alarmEnabled: Type.Union([Type.Boolean(), Type.Null()]),
    ts: Type.String(),
  });

  const Response = Type.Array(DoorEvent);

  fastify.get<{ Params: ParamsType }>(
    "/",
    {
      schema: {
        tags: ["events"],
        params: Params,
        response: {
          200: Response,
        },
      },
    },
    async (request, reply) => {
      const { deviceId } = request.params;
      const user = request.user;

      await fastify.authorizeDeviceAccess(deviceId, user.userId);

      const rows = await fastify.db
        .select({
          id: doorEvents.id,
          doorState: doorEvents.doorState,
          battery: doorEvents.battery,
          alarmEnabled: doorEvents.alarmEnabled,
          ts: doorEvents.ts,
        })
        .from(doorEvents)
        .where(eq(doorEvents.deviceId, deviceId))
        .orderBy(desc(doorEvents.ts))
        .limit(100);

      const result = rows.map((e) => ({
        id: e.id,
        doorState: e.doorState,
        battery: e.battery != null ? Number(e.battery) : null,
        alarmEnabled: e.alarmEnabled ?? null,
        ts: e.ts.toISOString(),
      }));

      return reply.send(result);
    },
  );
};

export default plugin;
