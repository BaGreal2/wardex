import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type, type Static } from "@sinclair/typebox";

import { devices } from "@/db/schema";

const DEMO_OWNER_ID = "275eab68-f109-4bb7-ba30-446c620fc5f4";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const DeviceSummary = Type.Object({
    id: Type.String(),
    name: Type.String(),
    type: Type.String(),
    roomName: Type.Union([Type.String(), Type.Null()]),
    lastDoorState: Type.Union([Type.String(), Type.Null()]),
    lastBattery: Type.Union([Type.Number(), Type.Null()]),
    lastSeenAt: Type.Union([Type.String(), Type.Null()]),
    isOnline: Type.Union([Type.Boolean(), Type.Null()]),
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
    lastBattery: Type.Union([Type.Number(), Type.Null()]),
    lastSeenAt: Type.Union([Type.String(), Type.Null()]),
    isOnline: Type.Union([Type.Boolean(), Type.Null()]),
    createdAt: Type.String(),
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
    async () => {
      const rows = await fastify.db
        .select({
          id: devices.id,
          name: devices.name,
          type: devices.type,
          roomName: devices.roomName,
          lastDoorState: devices.lastDoorState,
          lastBattery: devices.lastBattery,
          lastSeenAt: devices.lastSeenAt,
          isOnline: devices.isOnline,
        })
        .from(devices);

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

      const newDevice = {
        ownerId: DEMO_OWNER_ID,
        name,
        type: type ?? "home",
        roomName: roomName ?? null,
      } satisfies typeof devices.$inferInsert;

      const insertedRows = await fastify.db.insert(devices).values(newDevice).returning();
      const inserted = insertedRows[0];
      if (!inserted) {
        throw fastify.httpErrors.internalServerError("Failed to create device");
      }

      return reply.code(201).send({
        id: inserted.id,
        name: inserted.name,
        type: inserted.type,
        roomName: inserted.roomName,
        wifiSsid: inserted.wifiSsid ?? null,
        isEnabled: inserted.isEnabled ?? true,
        lastDoorState: inserted.lastDoorState ?? null,
        lastBattery: inserted.lastBattery ? Number(inserted.lastBattery) : null,
        lastSeenAt: inserted.lastSeenAt ? inserted.lastSeenAt.toISOString() : null,
        isOnline: inserted.isOnline ?? null,
        createdAt: inserted.createdAt.toISOString(),
      });
    },
  );
};

export default plugin;
