import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type, type Static } from "@sinclair/typebox";
import { eq } from "drizzle-orm";

import { alarmEvents, devices, doorEvents } from "@/db/schema";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const Params = Type.Object({
    deviceId: Type.String(),
  });

  const Body = Type.Object({
    door: Type.Union([Type.Literal("open"), Type.Literal("close")]),
    battery: Type.Number(),
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
      const { door, battery, ts } = request.body;

      const tsDate = new Date(ts * 1000);

      const [deviceRow] = await fastify.db
        .select({
          alarmEnabled: devices.alarmEnabled,
          lastAlarmState: devices.lastAlarmState,
        })
        .from(devices)
        .where(eq(devices.id, deviceId))
        .limit(1);

      const armed = !!deviceRow?.alarmEnabled;
      const wasTriggered = deviceRow?.lastAlarmState === "alarm";
      const alarmTriggered = armed && door === "open";

      await fastify.db.insert(doorEvents).values({
        deviceId,
        doorState: door,
        battery,
        alarmEnabled: armed,
        ts: tsDate,
      });

      if (alarmTriggered && !wasTriggered) {
        await fastify.db.insert(alarmEvents).values({
          deviceId,
          eventType: "alarm_triggered",
          ts: tsDate,
          triggeredByUserId: null,
        });
      }

      const update: Partial<typeof devices.$inferInsert> = {
        lastDoorState: door,
        lastBattery: battery,
        lastSeenAt: tsDate,
        isOnline: true,
      };

      if (alarmTriggered) {
        update.lastAlarmState = "alarm";
      }

      await fastify.db.update(devices).set(update).where(eq(devices.id, deviceId));

      fastify.notifyDeviceUpdated(deviceId);

      return { ok: true };
    },
  );
};

export default plugin;
