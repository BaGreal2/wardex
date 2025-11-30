import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type, type Static } from "@sinclair/typebox";
import { desc, eq } from "drizzle-orm";

import { alarmEvents } from "@/db/schema";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  const Params = Type.Object({
    deviceId: Type.String(),
  });
  type ParamsType = Static<typeof Params>;

  const AlarmEvent = Type.Object({
    id: Type.Number(),
    eventType: Type.String(), // 'alarm_on', 'alarm_off', 'alarm_triggered'
    ts: Type.String(),
  });

  const Response = Type.Array(AlarmEvent);

  fastify.get<{ Params: ParamsType }>(
    "/",
    {
      schema: {
        tags: ["alarm"],
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
          id: alarmEvents.id,
          eventType: alarmEvents.eventType,
          ts: alarmEvents.ts,
        })
        .from(alarmEvents)
        .where(eq(alarmEvents.deviceId, deviceId))
        .orderBy(desc(alarmEvents.ts))
        .limit(100);

      const result = rows.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        ts: e.ts.toISOString(),
      }));

      return reply.send(result);
    },
  );
};

export default plugin;
