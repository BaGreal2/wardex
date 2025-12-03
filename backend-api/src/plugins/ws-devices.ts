import websocket from "@fastify/websocket";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { WebSocket } from "ws";

declare module "fastify" {
  interface FastifyInstance {
    notifyDeviceUpdated(deviceId: string): void;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(websocket);

  const clients = new Set<WebSocket>();

  fastify.get("/ws/devices", { websocket: true }, (socket /* WebSocket */, _req) => {
    clients.add(socket);

    socket.on("close", () => {
      clients.delete(socket);
    });
  });

  fastify.decorate("notifyDeviceUpdated", (deviceId: string) => {
    const msg = JSON.stringify({
      type: "device-updated",
      deviceId,
    });

    for (const s of clients) {
      try {
        s.send(msg);
      } catch (err) {
        fastify.log.warn({ err }, "failed to send ws message");
      }
    }
  });
});
