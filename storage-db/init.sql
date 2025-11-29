CREATE TABLE IF NOT EXISTS door_events (
  id             serial PRIMARY KEY,
  device_id      text NOT NULL,
  door_state     text NOT NULL,
  battery        numeric(5,2),
  alarm_enabled  boolean,
  ts             timestamptz NOT NULL
);
