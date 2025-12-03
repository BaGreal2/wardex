import { browser } from "$app/environment";

type DeviceInfo = {
  id: string;
  name?: string;
  lastAlarmState?: string | null;
};

export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  if (!browser || !("Notification" in window)) return "denied";

  if (Notification.permission === "default") {
    return Notification.requestPermission();
  }

  return Notification.permission;
}

export async function showDeviceUpdatedNotification(device: DeviceInfo) {
  if (!browser || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (device.lastAlarmState !== "alarm") return;

  const title = device.name ? `Device "${device.name}" alarmed!` : "Device alarmed";

  const options: NotificationOptions = {
    body: "Tap to view device details",
    tag: `device-${device.id}`,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    data: {
      deviceId: device.id
    }
  };

  const reg = await navigator.serviceWorker.getRegistration();

  if (reg) {
    reg.showNotification(title, options);
  } else {
    new Notification(title, options);
  }
}
