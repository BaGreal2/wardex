import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type, type Static } from "@sinclair/typebox";
import { eq } from "drizzle-orm";

import { devices, doorEvents } from "@/db/schema";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const Params = Type.Object({
    deviceId: Type.String(),
  });

  const Body = Type.Object({
    door: Type.Union([Type.Literal("open"), Type.Literal("close")]),
    battery: Type.Number(),
    alarmEnabled: Type.Optional(Type.Boolean()),
    ts: Type.Number(),
  });

  type IngestParams = Static<typeof Params>;
  type IngestBody = Static<typeof Body>;

  const Response = Type.Object({
    ok: Type.Boolean(),
  });

  fastify.post<{ Params: IngestParams; Body: IngestBody }>(
    "/",
    {
      schema: {
        tags: ["events"],
        params: Params,
        body: Body,
        response: {
          200: Response,
        },
      },
    },
    async (request) => {
      const { deviceId } = request.params;
      const { door, battery, alarmEnabled, ts } = request.body;

      const tsDate = new Date(ts * 1000);

      type NewDoorEvent = typeof doorEvents.$inferInsert;

      const newEvent: NewDoorEvent = {
        deviceId,
        doorState: door,
        battery,
        alarmEnabled: alarmEnabled ?? null,
        ts: tsDate,
      };

      await fastify.db.insert(doorEvents).values(newEvent);

      await fastify.db
        .update(devices)
        .set({
          lastDoorState: door,
          lastBattery: battery,
          lastSeenAt: tsDate,
          isOnline: true,
        })
        .where(eq(devices.id, deviceId));

      return { ok: true };
    },
  );
};

export default plugin;
