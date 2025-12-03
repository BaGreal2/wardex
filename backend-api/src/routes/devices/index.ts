import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type, type Static } from "@sinclair/typebox";
import { eq, or } from "drizzle-orm";

import { deviceAccess, devices } from "@/db/schema";
import { ensureIotDevice } from "@/iot/registry";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  const DeviceSummary = Type.Object({
    id: Type.String(),
    name: Type.String(),
    type: Type.String(),
    roomName: Type.Union([Type.String(), Type.Null()]),
    lastDoorState: Type.Union([Type.String(), Type.Null()]),
    lastAlarmState: Type.Union([Type.String(), Type.Null()]),
    lastBattery: Type.Union([Type.Number(), Type.Null()]),
    lastSeenAt: Type.Union([Type.String(), Type.Null()]),
    isOnline: Type.Union([Type.Boolean(), Type.Null()]),
    alarmEnabled: Type.Union([Type.Boolean(), Type.Null()]),
  });

  const Body = Type.Object({
    name: Type.String(),
    type: Type.Optional(Type.String()),
    roomName: Type.Optional(Type.String()),
  });

  type CreateDeviceBody = Static<typeof Body>;

  const DeviceDetail = Type.Object({
    id: Type.String(),
    name: Type.String(),
    type: Type.String(),
    roomName: Type.Union([Type.String(), Type.Null()]),
    wifiSsid: Type.Union([Type.String(), Type.Null()]),
    isEnabled: Type.Boolean(),
    lastDoorState: Type.Union([Type.String(), Type.Null()]),
    lastAlarmState: Type.Union([Type.String(), Type.Null()]),
    lastBattery: Type.Union([Type.Number(), Type.Null()]),
    lastSeenAt: Type.Union([Type.String(), Type.Null()]),
    isOnline: Type.Union([Type.Boolean(), Type.Null()]),
    createdAt: Type.String(),
    deviceKey: Type.Union([Type.String(), Type.Null()]),
    alarmEnabled: Type.Union([Type.Boolean(), Type.Null()]),
  });

  fastify.get(
    "/",
    {
      schema: {
        tags: ["devices"],
        response: {
          200: Type.Array(DeviceSummary),
        },
      },
    },
    async (request) => {
      const user = request.user;

      const rows = await fastify.db
        .select({
          id: devices.id,
          name: devices.name,
          type: devices.type,
          roomName: devices.roomName,
          lastDoorState: devices.lastDoorState,
          lastAlarmState: devices.lastAlarmState,
          lastBattery: devices.lastBattery,
          lastSeenAt: devices.lastSeenAt,
          isOnline: devices.isOnline,
          alarmEnabled: devices.alarmEnabled,
        })
        .from(devices)
        .leftJoin(deviceAccess, eq(deviceAccess.deviceId, devices.id))
        .where(or(eq(devices.ownerId, user.userId), eq(deviceAccess.userId, user.userId)));

      return rows.map((d) => ({
        ...d,
        lastSeenAt: d.lastSeenAt ? d.lastSeenAt.toISOString() : null,
        lastBattery: d.lastBattery ? Number(d.lastBattery) : null,
      }));
    },
  );

  fastify.post<{ Body: CreateDeviceBody }>(
    "/",
    {
      schema: {
        tags: ["devices"],
        body: Body,
        response: {
          201: DeviceDetail,
        },
      },
    },
    async (request, reply) => {
      const { name, type, roomName } = request.body;
      const user = request.user;

      const newDevice = {
        ownerId: user.userId,
        name,
        type: type ?? "home",
        roomName: roomName ?? null,
      } satisfies typeof devices.$inferInsert;

      const [inserted] = await fastify.db.insert(devices).values(newDevice).returning();

      if (!inserted) {
        throw fastify.httpErrors.internalServerError("Failed to create device");
      }

      let deviceKey: string | null = null;

      try {
        const res = await ensureIotDevice(inserted.id);
        deviceKey = res.primaryKey;
      } catch (err) {
        fastify.log.error({ err }, "Failed to ensure IoT Hub device");
        throw fastify.httpErrors.internalServerError("Failed to provision IoT Hub device");
      }

      if (deviceKey) {
        await fastify.db.update(devices).set({ deviceKey }).where(eq(devices.id, inserted.id));
      }

      return reply.code(201).send({
        id: inserted.id,
        name: inserted.name,
        type: inserted.type,
        roomName: inserted.roomName,
        wifiSsid: inserted.wifiSsid ?? null,
        isEnabled: inserted.isEnabled ?? true,
        lastDoorState: inserted.lastDoorState ?? null,
        lastAlarmState: inserted.lastAlarmState ?? null,
        lastBattery: inserted.lastBattery != null ? Number(inserted.lastBattery) : null,
        lastSeenAt: inserted.lastSeenAt ? inserted.lastSeenAt.toISOString() : null,
        isOnline: inserted.isOnline ?? null,
        createdAt: inserted.createdAt.toISOString(),
        deviceKey: deviceKey ?? null,
      });
    },
  );
};

export default plugin;
