import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { eq, inArray, or } from "drizzle-orm";

import { alarmEvents, deviceAccess, devices, doorEvents } from "@/db/schema";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  const UserEvent = Type.Object({
    id: Type.Number(),
    deviceId: Type.String(),
    kind: Type.Union([Type.Literal("door"), Type.Literal("alarm")]),
    doorState: Type.Union([Type.String(), Type.Null()]),
    battery: Type.Union([Type.Number(), Type.Null()]),
    alarmEnabled: Type.Union([Type.Boolean(), Type.Null()]),
    alarmEventType: Type.Union([Type.String(), Type.Null()]),
    ts: Type.String(),
  });

  fastify.get(
    "/",
    {
      schema: {
        tags: ["events"],
        response: {
          200: Type.Array(UserEvent),
        },
      },
    },
    async (request, reply) => {
      const user = request.user;

      const deviceRows = await fastify.db
        .select({
          id: devices.id,
        })
        .from(devices)
        .leftJoin(deviceAccess, eq(deviceAccess.deviceId, devices.id))
        .where(or(eq(devices.ownerId, user.userId), eq(deviceAccess.userId, user.userId)));

      const deviceIds = deviceRows.map((d) => d.id);

      if (deviceIds.length === 0) {
        return reply.send([]);
      }

      const [doorRows, alarmRows] = await Promise.all([
        fastify.db
          .select({
            id: doorEvents.id,
            deviceId: doorEvents.deviceId,
            doorState: doorEvents.doorState,
            battery: doorEvents.battery,
            alarmEnabled: doorEvents.alarmEnabled,
            ts: doorEvents.ts,
          })
          .from(doorEvents)
          .where(inArray(doorEvents.deviceId, deviceIds)),
        fastify.db
          .select({
            id: alarmEvents.id,
            deviceId: alarmEvents.deviceId,
            eventType: alarmEvents.eventType,
            ts: alarmEvents.ts,
          })
          .from(alarmEvents)
          .where(inArray(alarmEvents.deviceId, deviceIds)),
      ]);

      const combined = [
        ...doorRows.map((e) => ({
          id: e.id,
          deviceId: e.deviceId,
          kind: "door" as const,
          doorState: e.doorState,
          battery: e.battery != null ? Number(e.battery) : null,
          alarmEnabled: e.alarmEnabled ?? null,
          alarmEventType: null,
          ts: e.ts,
        })),
        ...alarmRows.map((e) => ({
          id: e.id,
          deviceId: e.deviceId,
          kind: "alarm" as const,
          doorState: null,
          battery: null,
          alarmEnabled: null,
          alarmEventType: e.eventType,
          ts: e.ts,
        })),
      ];

      combined.sort((a, b) => b.ts.getTime() - a.ts.getTime());

      const result = combined.map((e) => ({
        id: e.id,
        deviceId: e.deviceId,
        kind: e.kind,
        doorState: e.doorState,
        battery: e.battery,
        alarmEnabled: e.alarmEnabled,
        alarmEventType: e.alarmEventType,
        ts: e.ts.toISOString(),
      }));

      return reply.send(result);
    },
  );
};

export default plugin;
