import { and, eq, or } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { deviceAccess, devices } from "@/db/schema";

async function authorizeDeviceAccessPlugin(fastify: FastifyInstance) {
  fastify.decorate("authorizeDeviceAccess", async (deviceId: string, userId: string) => {
    const rows = await fastify.db
      .select({ deviceId: devices.id })
      .from(devices)
      .leftJoin(deviceAccess, eq(deviceAccess.deviceId, devices.id))
      .where(
        and(
          eq(devices.id, deviceId),
          or(eq(devices.ownerId, userId), eq(deviceAccess.userId, userId)),
        ),
      )
      .limit(1);

    if (!rows[0]) {
      throw fastify.httpErrors.forbidden("No access to this device");
    }
  });
}

export default fp(authorizeDeviceAccessPlugin, {
  name: "authorize-device-access",
});
