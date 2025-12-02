import {
  bigserial,
  boolean,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const devices = pgTable("devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull().default("home"),
  roomName: text("room_name"),
  wifiSsid: text("wifi_ssid"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  lastBattery: numeric("last_battery", { precision: 5, scale: 2 }).$type<number>(),
  lastDoorState: text("last_door_state"),
  lastAlarmState: text("last_alarm_state"),
  isOnline: boolean("is_online"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

  deviceKey: text("device_key"),
});

export const deviceAccess = pgTable("device_access", {
  id: serial("id").primaryKey(),
  deviceId: uuid("device_id").notNull(),
  userId: uuid("user_id").notNull(),
  role: text("role").notNull().default("viewer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const doorEvents = pgTable("door_events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  deviceId: uuid("device_id").notNull(),
  doorState: text("door_state").notNull(),
  battery: numeric("battery", { precision: 5, scale: 2 }).$type<number>(),
  alarmEnabled: boolean("alarm_enabled"),
  ts: timestamp("ts", { withTimezone: true }).notNull(),
});

export const alarmEvents = pgTable("alarm_events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  deviceId: uuid("device_id").notNull(),
  eventType: text("event_type").notNull(), // 'alarm_on' | 'alarm_off' | 'alarm_triggered'
  ts: timestamp("ts", { withTimezone: true }).notNull(),
  triggeredByUserId: uuid("triggered_by_user_id"),
});
