import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type, type Static } from "@sinclair/typebox";
import { eq } from "drizzle-orm";

import { devices } from "@/db/schema";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const Params = Type.Object({
    deviceId: Type.String(),
  });
  type ParamsType = Static<typeof Params>;

  const DeviceDetail = Type.Object({
    id: Type.String(),
    name: Type.String(),
    type: Type.String(),
    roomName: Type.Union([Type.String(), Type.Null()]),
    wifiSsid: Type.Union([Type.String(), Type.Null()]),
    isEnabled: Type.Boolean(),
    lastDoorState: Type.Union([Type.String(), Type.Null()]),
    lastBattery: Type.Union([Type.Number(), Type.Null()]),
    lastSeenAt: Type.Union([Type.String(), Type.Null()]),
    isOnline: Type.Union([Type.Boolean(), Type.Null()]),
    createdAt: Type.String(),
  });

  fastify.get<{ Params: ParamsType }>(
    "/",
    {
      schema: {
        tags: ["devices"],
        params: Params,
        response: {
          200: DeviceDetail,
        },
      },
    },
    async (request, reply) => {
      const { deviceId } = request.params;

      const rows = await fastify.db.select().from(devices).where(eq(devices.id, deviceId)).limit(1);

      const d = rows[0];

      if (!d) {
        throw fastify.httpErrors.notFound("Device not found");
      }

      return reply.send({
        id: d.id,
        name: d.name,
        type: d.type,
        roomName: d.roomName,
        wifiSsid: d.wifiSsid ?? null,
        isEnabled: d.isEnabled ?? true,
        lastDoorState: d.lastDoorState ?? null,
        lastBattery: d.lastBattery != null ? Number(d.lastBattery) : null,
        lastSeenAt: d.lastSeenAt ? d.lastSeenAt.toISOString() : null,
        isOnline: d.isOnline ?? null,
        createdAt: d.createdAt.toISOString(),
      });
    },
  );
};

export default plugin;
