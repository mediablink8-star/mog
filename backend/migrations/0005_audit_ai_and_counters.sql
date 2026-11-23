-- 0005_audit_ai_and_counters.sql
-- Audit trail, AI conversation history, ticket sequence counters.

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT '',
  performed_by TEXT NOT NULL DEFAULT '',
  ip TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_business ON audit_logs (business_id, created_at DESC);

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  tool_usage JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_business ON ai_conversations (business_id, updated_at DESC);

CREATE TABLE system_counters (
  id TEXT PRIMARY KEY,
  seq INTEGER NOT NULL DEFAULT 0
);

INSERT INTO system_counters (id, seq) VALUES ('repair', 0) ON CONFLICT (id) DO NOTHING;
