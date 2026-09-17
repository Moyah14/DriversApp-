-- Additive domain tables for payments, parks, routes, wallets, support
-- Safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS)

-- Expand user roles for Plateau ops (agents / union heads)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('SYSTEM_ADMIN', 'TENANT_ADMIN', 'DRIVER', 'AGENT', 'UNION_HEAD'));

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tenant_role_chk;
ALTER TABLE users ADD CONSTRAINT users_tenant_role_chk CHECK (
  (role = 'SYSTEM_ADMIN' AND tenant_id IS NULL)
  OR (role IN ('TENANT_ADMIN', 'DRIVER', 'AGENT', 'UNION_HEAD') AND tenant_id IS NOT NULL)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS nin VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS license_ref VARCHAR(255);

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS park_id UUID;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS route_id UUID;

CREATE TABLE IF NOT EXISTS parks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  area VARCHAR(128),
  address TEXT,
  union_head_id UUID REFERENCES users(id) ON DELETE SET NULL,
  registered_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  area VARCHAR(128),
  park_a_id UUID REFERENCES parks(id) ON DELETE SET NULL,
  park_b_id UUID REFERENCES parks(id) ON DELETE SET NULL,
  registered_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE vehicles
    ADD CONSTRAINT vehicles_park_fk FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE vehicles
    ADD CONSTRAINT vehicles_route_fk FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL,
  payment_type VARCHAR(32) NOT NULL DEFAULT 'card'
    CHECK (payment_type IN ('card', 'deposit', 'transfer', 'topup')),
  status VARCHAR(32) NOT NULL DEFAULT 'success'
    CHECK (status IN ('success', 'failed', 'pending')),
  reference VARCHAR(64) NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parks_tenant ON parks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_routes_tenant ON routes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tenant ON support_tickets(tenant_id);

ALTER TABLE parks ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_replies ENABLE ROW LEVEL SECURITY;

ALTER TABLE parks FORCE ROW LEVEL SECURITY;
ALTER TABLE routes FORCE ROW LEVEL SECURITY;
ALTER TABLE wallets FORCE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;
ALTER TABLE support_tickets FORCE ROW LEVEL SECURITY;
ALTER TABLE support_replies FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS parks_isolation ON parks;
CREATE POLICY parks_isolation ON parks FOR ALL
  USING (app_is_system_admin() OR tenant_id = app_current_tenant())
  WITH CHECK (app_is_system_admin() OR tenant_id = app_current_tenant());

DROP POLICY IF EXISTS routes_isolation ON routes;
CREATE POLICY routes_isolation ON routes FOR ALL
  USING (app_is_system_admin() OR tenant_id = app_current_tenant())
  WITH CHECK (app_is_system_admin() OR tenant_id = app_current_tenant());

DROP POLICY IF EXISTS wallets_isolation ON wallets;
CREATE POLICY wallets_isolation ON wallets FOR ALL
  USING (app_is_system_admin() OR tenant_id = app_current_tenant())
  WITH CHECK (app_is_system_admin() OR tenant_id = app_current_tenant());

DROP POLICY IF EXISTS payments_isolation ON payments;
CREATE POLICY payments_isolation ON payments FOR ALL
  USING (app_is_system_admin() OR tenant_id = app_current_tenant())
  WITH CHECK (app_is_system_admin() OR tenant_id = app_current_tenant());

DROP POLICY IF EXISTS support_tickets_isolation ON support_tickets;
CREATE POLICY support_tickets_isolation ON support_tickets FOR ALL
  USING (app_is_system_admin() OR tenant_id = app_current_tenant() OR tenant_id IS NULL)
  WITH CHECK (app_is_system_admin() OR tenant_id = app_current_tenant() OR tenant_id IS NULL);

DROP POLICY IF EXISTS support_replies_isolation ON support_replies;
CREATE POLICY support_replies_isolation ON support_replies FOR ALL
  USING (
    app_is_system_admin()
    OR EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_id
        AND (t.tenant_id = app_current_tenant() OR t.tenant_id IS NULL)
    )
  )
  WITH CHECK (
    app_is_system_admin()
    OR EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_id
        AND (t.tenant_id = app_current_tenant() OR t.tenant_id IS NULL)
    )
  );
