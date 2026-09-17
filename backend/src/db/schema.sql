-- Multi-tenant fleet platform schema with PostgreSQL Row-Level Security

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(32) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL
    CHECK (role IN ('SYSTEM_ADMIN', 'TENANT_ADMIN', 'DRIVER', 'AGENT', 'UNION_HEAD')),
  phone VARCHAR(64),
  nin VARCHAR(64),
  address TEXT,
  license_ref VARCHAR(255),
  status VARCHAR(32) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_tenant_role_chk CHECK (
    (role = 'SYSTEM_ADMIN' AND tenant_id IS NULL)
    OR (role IN ('TENANT_ADMIN', 'DRIVER', 'AGENT', 'UNION_HEAD') AND tenant_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plate_number VARCHAR(64) NOT NULL,
  make VARCHAR(128),
  model VARCHAR(128),
  vehicle_type VARCHAR(64) DEFAULT 'bus',
  status VARCHAR(32) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'maintenance', 'inactive')),
  assigned_driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, plate_number)
);

CREATE TABLE IF NOT EXISTS telemetry_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  speed_kmh DOUBLE PRECISION NOT NULL DEFAULT 0,
  engine_rpm DOUBLE PRECISION,
  accelerator_pct DOUBLE PRECISION,
  dtc_codes TEXT[],
  event_type VARCHAR(32) NOT NULL DEFAULT 'normal'
    CHECK (event_type IN ('normal', 'speeding', 'harsh_braking', 'excessive_idling')),
  penalty_points DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS driver_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  score NUMERIC(5,2) NOT NULL DEFAULT 100
    CHECK (score >= 0 AND score <= 100),
  total_penalties NUMERIC(10,2) NOT NULL DEFAULT 0,
  speeding_events INT NOT NULL DEFAULT 0,
  harsh_braking_events INT NOT NULL DEFAULT 0,
  idling_events INT NOT NULL DEFAULT 0,
  distance_km NUMERIC(12,2) NOT NULL DEFAULT 0,
  period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  period_end DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, driver_id, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  alert_type VARCHAR(64) NOT NULL,
  severity VARCHAR(16) NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(128) NOT NULL,
  resource VARCHAR(128),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for RLS + telemetry performance
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant ON vehicles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_tenant ON telemetry_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle_time ON telemetry_logs(vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_scores_tenant ON driver_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_tenant ON alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Apply RLS even for table owner (required for true multi-tenant isolation)
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE vehicles FORCE ROW LEVEL SECURITY;
ALTER TABLE telemetry_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE driver_scores FORCE ROW LEVEL SECURITY;
ALTER TABLE alerts FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- Bypass for migrations / superuser app role via session flag
-- Policies use app.current_tenant_id and app.current_role

CREATE OR REPLACE FUNCTION app_current_tenant() RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION app_current_role() RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(NULLIF(current_setting('app.current_role', true), ''), '');
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION app_is_system_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN app_current_role() = 'SYSTEM_ADMIN';
END;
$$ LANGUAGE plpgsql STABLE;

-- Tenants: system admin sees all; tenant users see own tenant
DROP POLICY IF EXISTS tenants_isolation ON tenants;
CREATE POLICY tenants_isolation ON tenants
  FOR ALL
  USING (
    app_is_system_admin()
    OR id = app_current_tenant()
  )
  WITH CHECK (
    app_is_system_admin()
    OR id = app_current_tenant()
  );

-- Users
DROP POLICY IF EXISTS users_isolation ON users;
CREATE POLICY users_isolation ON users
  FOR ALL
  USING (
    app_is_system_admin()
    OR tenant_id = app_current_tenant()
  )
  WITH CHECK (
    app_is_system_admin()
    OR tenant_id = app_current_tenant()
  );

-- Vehicles
DROP POLICY IF EXISTS vehicles_isolation ON vehicles;
CREATE POLICY vehicles_isolation ON vehicles
  FOR ALL
  USING (
    app_is_system_admin()
    OR tenant_id = app_current_tenant()
  )
  WITH CHECK (
    app_is_system_admin()
    OR tenant_id = app_current_tenant()
  );

-- Telemetry
DROP POLICY IF EXISTS telemetry_isolation ON telemetry_logs;
CREATE POLICY telemetry_isolation ON telemetry_logs
  FOR ALL
  USING (
    app_is_system_admin()
    OR tenant_id = app_current_tenant()
  )
  WITH CHECK (
    app_is_system_admin()
    OR tenant_id = app_current_tenant()
  );

-- Driver scores
DROP POLICY IF EXISTS scores_isolation ON driver_scores;
CREATE POLICY scores_isolation ON driver_scores
  FOR ALL
  USING (
    app_is_system_admin()
    OR tenant_id = app_current_tenant()
  )
  WITH CHECK (
    app_is_system_admin()
    OR tenant_id = app_current_tenant()
  );

-- Alerts
DROP POLICY IF EXISTS alerts_isolation ON alerts;
CREATE POLICY alerts_isolation ON alerts
  FOR ALL
  USING (
    app_is_system_admin()
    OR tenant_id = app_current_tenant()
  )
  WITH CHECK (
    app_is_system_admin()
    OR tenant_id = app_current_tenant()
  );

-- Audit logs: system admin all; tenant admin own tenant
DROP POLICY IF EXISTS audit_isolation ON audit_logs;
CREATE POLICY audit_isolation ON audit_logs
  FOR ALL
  USING (
    app_is_system_admin()
    OR tenant_id = app_current_tenant()
  )
  WITH CHECK (
    app_is_system_admin()
    OR tenant_id = app_current_tenant()
  );
