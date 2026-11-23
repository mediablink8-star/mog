-- 0004_repairs.sql
-- Repair tickets, status history, notes, diagnosis.

CREATE TABLE repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  device_manufacturer TEXT NOT NULL DEFAULT '',
  device_model TEXT NOT NULL DEFAULT '',
  device_type TEXT NOT NULL DEFAULT '',
  imei_serial TEXT NOT NULL DEFAULT '',
  issue TEXT NOT NULL DEFAULT '',
  physical_condition TEXT NOT NULL DEFAULT '',
  accessories_received TEXT NOT NULL DEFAULT '',
  est_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  quoted_date DATE,
  labour_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  final_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  technician TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN (
    'Received', 'Diagnosing', 'Waiting for approval',
    'Waiting for parts', 'In progress', 'Ready for collection',
    'Completed', 'Cancelled'
  )),
  date_received TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_repairs_ticket_number ON repairs (ticket_number);
CREATE INDEX idx_repairs_business_status ON repairs (business_id, status);
CREATE INDEX idx_repairs_date_received ON repairs (date_received);
CREATE INDEX idx_repairs_customer ON repairs (customer_id);

CREATE TABLE repair_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id UUID NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL DEFAULT '',
  to_status TEXT NOT NULL,
  changed_by TEXT NOT NULL DEFAULT '',
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_history_repair ON repair_status_history (repair_id);

CREATE TABLE repair_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id UUID NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
  author TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_repair ON repair_notes (repair_id);

CREATE TABLE repair_diagnosis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id UUID NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
  diagnosis TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_diagnosis_repair ON repair_diagnosis (repair_id);

CREATE TABLE repair_parts_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id UUID NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parts_repair ON repair_parts_used (repair_id);
