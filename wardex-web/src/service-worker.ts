/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  const notification = event.notification;
  const data = (notification.data || {}) as { deviceId?: string };

  const deviceId = data.deviceId;
  notification.close();

  const url = deviceId ? `/devices/${deviceId}` : "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of allClients) {
        const c = client as WindowClient;

        if ("navigate" in c) {
          await c.navigate(url);
        }

        return c.focus();
      }

      // no open window, open a new one
      return self.clients.openWindow(url);
    })()
  );
});

export { };
