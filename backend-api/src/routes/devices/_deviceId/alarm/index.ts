import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type, type Static } from "@sinclair/typebox";
import { eq } from "drizzle-orm";

import { alarmEvents, devices } from "@/db/schema";
import { sendAlarmCommandToDevice } from "@/iot/iothub";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  const Params = Type.Object({
    deviceId: Type.String(),
  });
  type ParamsType = Static<typeof Params>;

  const Body = Type.Object({
    action: Type.Union([Type.Literal("on"), Type.Literal("off")]),
  });
  type BodyType = Static<typeof Body>;

  const Response = Type.Object({
    ok: Type.Boolean(),
  });

  fastify.post<{ Params: ParamsType; Body: BodyType }>(
    "/",
    {
      schema: {
        tags: ["alarm"],
        params: Params,
        body: Body,
        response: {
          200: Response,
        },
      },
    },
    async (request, reply) => {
      const { deviceId } = request.params;
      const { action } = request.body;
      const user = request.user;

      const now = new Date();
      const enabled = action === "on";
      const eventType = action === "on" ? "alarm_armed" : "alarm_disarmed";

      await fastify.db.insert(alarmEvents).values({
        deviceId,
        eventType,
        ts: now,
        triggeredByUserId: user.userId,
      });

      await fastify.db
        .update(devices)
        .set({
          // lastAlarmState: alarmState,
          alarmEnabled: enabled,
          lastSeenAt: now,
          isOnline: true,
        })
        .where(eq(devices.id, deviceId));

      if (deviceId) {
        try {
          await sendAlarmCommandToDevice(deviceId, action === "on");
          request.log.info({ deviceId, action }, "C2D alarm command sent");
        } catch (err) {
          request.log.error({ err, deviceId }, "Failed to send C2D alarm command");
        }
      } else {
        request.log.warn(
          { deviceId },
          "No IoT device mapping for this backend device; skipping C2D",
        );
      }

      return reply.send({
        ok: true,
      });
    },
  );
};

export default plugin;
