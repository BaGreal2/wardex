-- USERS: app accounts
CREATE TABLE IF NOT EXISTS users (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text UNIQUE NOT NULL,
  display_name text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- DEVICES: doors / sensors
CREATE TABLE IF NOT EXISTS devices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            text NOT NULL,               -- "Front door", "Office door"
  type            text NOT NULL DEFAULT 'home',-- home / work / other
  room_name       text,                        -- "Bedroom", "Hallway"
  icon            text,                        -- optional icon name
  color           text,                        -- optional color code
  installed_at    timestamptz NOT NULL DEFAULT now(),
  is_enabled      boolean NOT NULL DEFAULT true,
  wifi_ssid       text,                        -- optional, show in UI
  last_seen_at    timestamptz,                 -- updated by backend
  last_battery    numeric(5,2),
  last_door_state text,                        -- 'open' / 'close'
  last_alarm_state text,                       -- 'idle' / 'alarm'
  is_online       boolean,                     -- derived from last_seen_at but can be cached
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- DEVICE ACCESS: sharing devices with other users
CREATE TABLE IF NOT EXISTS device_access (
  id          serial PRIMARY KEY,
  device_id   uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'viewer',   -- 'owner' / 'viewer' / 'admin'
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, user_id)
);

-- DOOR EVENTS: history of open/close + battery, alarmEnabled at that time
CREATE TABLE IF NOT EXISTS door_events (
  id             bigserial PRIMARY KEY,
  device_id      uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  door_state     text NOT NULL,                -- 'open' / 'close'
  battery        numeric(5,2),
  alarm_enabled  boolean,
  ts             timestamptz NOT NULL,
  home_mode      text,                         -- 'home' / 'away' (optional for later)
  triggered_by_user_id uuid REFERENCES users(id)  -- if action came from user (optional)
);

-- ALARM EVENTS: history of alarm on/off
CREATE TABLE IF NOT EXISTS alarm_events (
  id             bigserial PRIMARY KEY,
  device_id      uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  event_type     text NOT NULL,           -- 'alarm_on', 'alarm_off', 'alarm_triggered'
  ts             timestamptz NOT NULL,
  triggered_by_user_id uuid REFERENCES users(id)  -- user who disabled/alarmed, if any
);

-- simple index for querying recent events per device
CREATE INDEX IF NOT EXISTS idx_door_events_device_ts
  ON door_events (device_id, ts DESC);

CREATE INDEX IF NOT EXISTS idx_alarm_events_device_ts
  ON alarm_events (device_id, ts DESC);
