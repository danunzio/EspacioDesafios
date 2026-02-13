-- =====================================================
-- Espacio Desafíos - Database Schema
-- Supabase PostgreSQL Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'professional' CHECK (role IN ('admin', 'professional', 'assistant')),
  specialty TEXT,
  license_number TEXT,
  hourly_rate DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children table
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  birth_date DATE,
  document_number TEXT UNIQUE,
  health_insurance TEXT,
  affiliate_number TEXT,
  diagnostic TEXT,
  guardian_name TEXT NOT NULL,
  guardian_phone TEXT,
  guardian_email TEXT,
  guardian_relationship TEXT,
  secondary_contact_name TEXT,
  secondary_contact_phone TEXT,
  address TEXT,
  city TEXT DEFAULT 'Córdoba',
  state TEXT DEFAULT 'Córdoba',
  country TEXT DEFAULT 'Argentina',
  assigned_professional_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module values table (configurable values)
CREATE TABLE module_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_name TEXT NOT NULL UNIQUE,
  base_value DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly sessions table
CREATE TABLE monthly_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  module_name TEXT NOT NULL REFERENCES module_values(module_name),
  session_count INTEGER NOT NULL DEFAULT 0 CHECK (session_count >= 0),
  individual_sessions INTEGER DEFAULT 0 CHECK (individual_sessions >= 0),
  group_sessions INTEGER DEFAULT 0 CHECK (group_sessions >= 0),
  observations TEXT,
  is_confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id, child_id, year, month, module_name)
);

-- Liquidations table
CREATE TABLE liquidations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  module_breakdown JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES profiles(id),
  payment_reference TEXT,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id, year, month)
);

-- Commission payments table
CREATE TABLE commission_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liquidation_id UUID NOT NULL REFERENCES liquidations(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('transfer', 'cash', 'check', 'other')),
  payment_date DATE NOT NULL,
  payment_reference TEXT,
  bank_name TEXT,
  account_number TEXT,
  observations TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session statistics table (for reporting)
CREATE TABLE session_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  total_sessions INTEGER DEFAULT 0,
  individual_sessions INTEGER DEFAULT 0,
  group_sessions INTEGER DEFAULT 0,
  unique_children INTEGER DEFAULT 0,
  total_hours DECIMAL(8, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id, year, month)
);

-- Push subscriptions table
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  performed_by UUID REFERENCES profiles(id),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Children indexes
CREATE INDEX idx_children_professional ON children(assigned_professional_id);
CREATE INDEX idx_children_active ON children(is_active);
CREATE INDEX idx_children_name ON children(full_name);

-- Sessions indexes
CREATE INDEX idx_sessions_professional ON monthly_sessions(professional_id);
CREATE INDEX idx_sessions_child ON monthly_sessions(child_id);
CREATE INDEX idx_sessions_year_month ON monthly_sessions(year, month);
CREATE INDEX idx_sessions_professional_year_month ON monthly_sessions(professional_id, year, month);

-- Liquidations indexes
CREATE INDEX idx_liquidations_professional ON liquidations(professional_id);
CREATE INDEX idx_liquidations_year_month ON liquidations(year, month);
CREATE INDEX idx_liquidations_status ON liquidations(status);

-- Statistics indexes
CREATE INDEX idx_statistics_professional ON session_statistics(professional_id);
CREATE INDEX idx_statistics_year_month ON session_statistics(year, month);

-- Push subscriptions indexes
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);

-- Audit logs indexes
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_performed_at ON audit_logs(performed_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Children RLS policies
CREATE POLICY "All authenticated users can view children"
  ON children FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage all children"
  ON children FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Professionals can manage assigned children"
  ON children FOR ALL
  TO authenticated
  USING (
    assigned_professional_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Module values RLS policies
CREATE POLICY "All authenticated users can view module values"
  ON module_values FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage module values"
  ON module_values FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Monthly sessions RLS policies
CREATE POLICY "Professionals can view own sessions"
  ON monthly_sessions FOR SELECT
  TO authenticated
  USING (
    professional_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'assistant')
    )
  );

CREATE POLICY "Professionals can insert own sessions"
  ON monthly_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Professionals can update own sessions"
  ON monthly_sessions FOR UPDATE
  TO authenticated
  USING (
    professional_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete sessions"
  ON monthly_sessions FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Liquidations RLS policies
CREATE POLICY "Professionals can view own liquidations"
  ON liquidations FOR SELECT
  TO authenticated
  USING (
    professional_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'assistant')
    )
  );

CREATE POLICY "Admins can manage liquidations"
  ON liquidations FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'assistant')
  ));

-- Commission payments RLS policies
CREATE POLICY "Professionals can view own payments"
  ON commission_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM liquidations l 
      WHERE l.id = commission_payments.liquidation_id 
      AND l.professional_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'assistant')
    )
  );

CREATE POLICY "Admins can manage commission payments"
  ON commission_payments FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'assistant')
  ));

-- Statistics RLS policies
CREATE POLICY "All authenticated users can view statistics"
  ON session_statistics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage statistics"
  ON session_statistics FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Push subscriptions RLS policies
CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own subscriptions"
  ON push_subscriptions FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_values_updated_at
  BEFORE UPDATE ON module_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_sessions_updated_at
  BEFORE UPDATE ON monthly_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_liquidations_updated_at
  BEFORE UPDATE ON liquidations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_payments_updated_at
  BEFORE UPDATE ON commission_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_statistics_updated_at
  BEFORE UPDATE ON session_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_data, performed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, performed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_data, performed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to important tables
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_children
  AFTER INSERT OR UPDATE OR DELETE ON children
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_monthly_sessions
  AFTER INSERT OR UPDATE OR DELETE ON monthly_sessions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_liquidations
  AFTER INSERT OR UPDATE OR DELETE ON liquidations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_commission_payments
  AFTER INSERT OR UPDATE OR DELETE ON commission_payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default module values
INSERT INTO module_values (module_name, base_value, description) VALUES
  ('Psicomotricidad Relacional', 3500.00, 'Sesiones de psicomotricidad relacional'),
  ('Estimulación Temprana', 3200.00, 'Sesiones de estimulación temprana'),
  ('Psicopedagogía', 3800.00, 'Sesiones de psicopedagogía'),
  ('Psicología', 4000.00, 'Sesiones de psicología'),
  ('Fonoaudiología', 3600.00, 'Sesiones de fonoaudiología'),
  ('Terapia Ocupacional', 3700.00, 'Sesiones de terapia ocupacional'),
  ('Kinesiología', 3400.00, 'Sesiones de kinesiología'),
  ('Musicoterapia', 3300.00, 'Sesiones de musicoterapia'),
  ('Psicomotricidad Grupal', 2500.00, 'Sesiones grupales de psicomotricidad'),
  ('Taller de Juegos', 2200.00, 'Talleres grupales de juegos')
ON CONFLICT (module_name) DO NOTHING;

-- =====================================================
-- VIEWS
-- =====================================================

-- Monthly summary view
CREATE OR REPLACE VIEW monthly_summary AS
SELECT 
  ms.year,
  ms.month,
  p.full_name as professional_name,
  p.email as professional_email,
  COUNT(DISTINCT ms.child_id) as total_children,
  SUM(ms.session_count) as total_sessions,
  SUM(ms.individual_sessions) as total_individual,
  SUM(ms.group_sessions) as total_group,
  SUM(ms.session_count * mv.base_value) as estimated_amount,
  MAX(ms.updated_at) as last_updated
FROM monthly_sessions ms
JOIN profiles p ON ms.professional_id = p.id
JOIN module_values mv ON ms.module_name = mv.module_name
GROUP BY ms.year, ms.month, p.full_name, p.email
ORDER BY ms.year DESC, ms.month DESC, p.full_name;

-- Liquidation summary view
CREATE OR REPLACE VIEW liquidation_summary AS
SELECT 
  l.year,
  l.month,
  p.full_name as professional_name,
  l.total_sessions,
  l.total_amount,
  l.status,
  l.approved_at,
  l.paid_at,
  COALESCE(SUM(cp.amount), 0) as total_paid,
  l.total_amount - COALESCE(SUM(cp.amount), 0) as pending_amount
FROM liquidations l
JOIN profiles p ON l.professional_id = p.id
LEFT JOIN commission_payments cp ON l.id = cp.liquidation_id
GROUP BY l.id, l.year, l.month, p.full_name, l.total_sessions, l.total_amount, l.status, l.approved_at, l.paid_at
ORDER BY l.year DESC, l.month DESC, p.full_name;
