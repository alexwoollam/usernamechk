CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS outbox (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  payload JSONB NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_datetime TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inbox (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  payload JSONB NOT NULL,
  consumed BOOLEAN DEFAULT false,
  received_datetime TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
