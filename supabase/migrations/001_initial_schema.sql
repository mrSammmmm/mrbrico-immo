-- =========================================
-- MRBRICO IMMO - Schema Initial
-- =========================================
-- À exécuter dans l'éditeur SQL de Supabase

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- TABLE: users
-- =========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager')),
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- TABLE: property_managers
-- =========================================
CREATE TABLE IF NOT EXISTS property_managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- TABLE: buildings
-- =========================================
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID REFERENCES property_managers(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Sherbrooke',
  postal_code TEXT,
  unit_count INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- TABLE: work_requests
-- =========================================
CREATE TABLE IF NOT EXISTS work_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number TEXT UNIQUE NOT NULL,
  manager_id UUID REFERENCES property_managers(id) ON DELETE SET NULL,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,

  -- Détails de la demande
  unit_numbers TEXT[] NOT NULL,
  work_type TEXT NOT NULL,
  work_category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('normal', 'prioritaire', 'urgent')),
  description TEXT NOT NULL,
  access_info TEXT,

  -- Statut et workflow
  status TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN (
    'nouveau',
    'en_evaluation',
    'soumission_envoyee',
    'approuve',
    'en_cours',
    'complete',
    'facture'
  )),

  -- Assignation
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Préférences de contact
  contact_email BOOLEAN DEFAULT true,
  contact_phone BOOLEAN DEFAULT false,
  contact_sms BOOLEAN DEFAULT false,
  contact_portal BOOLEAN DEFAULT true,

  -- Intégration Trello
  trello_card_id TEXT,
  trello_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Coûts
  estimated_cost DECIMAL(10,2),
  final_cost DECIMAL(10,2)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_work_requests_status ON work_requests(status);
CREATE INDEX IF NOT EXISTS idx_work_requests_manager ON work_requests(manager_id);
CREATE INDEX IF NOT EXISTS idx_work_requests_created ON work_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_work_requests_priority ON work_requests(priority);

-- =========================================
-- TABLE: messages
-- =========================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_request_id UUID REFERENCES work_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'manager')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_request ON messages(work_request_id, created_at DESC);

-- =========================================
-- TABLE: photos
-- =========================================
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_request_id UUID REFERENCES work_requests(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  photo_type TEXT CHECK (photo_type IN ('initial', 'progress', 'completion')),
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_request ON photos(work_request_id, created_at);

-- =========================================
-- TABLE: documents
-- =========================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_request_id UUID REFERENCES work_requests(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  document_type TEXT NOT NULL CHECK (document_type IN ('quote', 'invoice', 'contract', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_request ON documents(work_request_id);

-- =========================================
-- TABLE: status_history
-- =========================================
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_request_id UUID REFERENCES work_requests(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_request ON status_history(work_request_id, created_at DESC);

-- =========================================
-- TRIGGER: updated_at automatique
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_managers_updated_at
    BEFORE UPDATE ON property_managers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buildings_updated_at
    BEFORE UPDATE ON buildings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_requests_updated_at
    BEFORE UPDATE ON work_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- FONCTION: Créer un utilisateur après signup
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'manager'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer l'utilisateur automatiquement
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- RLS (Row Level Security)
-- =========================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- =========================================
-- POLICIES: users
-- =========================================
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can read all users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =========================================
-- POLICIES: property_managers
-- =========================================
CREATE POLICY "Managers can read own profile"
ON property_managers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can read all managers"
ON property_managers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =========================================
-- POLICIES: buildings
-- =========================================
CREATE POLICY "Managers can read own buildings"
ON buildings FOR SELECT
TO authenticated
USING (
  manager_id IN (
    SELECT id FROM property_managers
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can read all buildings"
ON buildings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =========================================
-- POLICIES: work_requests
-- =========================================
CREATE POLICY "Managers see own requests"
ON work_requests FOR SELECT
TO authenticated
USING (
  manager_id IN (
    SELECT id FROM property_managers
    WHERE user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Managers can create requests"
ON work_requests FOR INSERT
TO authenticated
WITH CHECK (
  manager_id IN (
    SELECT id FROM property_managers
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Only admins can update requests"
ON work_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =========================================
-- POLICIES: messages
-- =========================================
CREATE POLICY "Users can read messages for their requests"
ON messages FOR SELECT
TO authenticated
USING (
  work_request_id IN (
    SELECT id FROM work_requests
    WHERE manager_id IN (
      SELECT id FROM property_managers WHERE user_id = auth.uid()
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can create messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
);

-- =========================================
-- POLICIES: photos & documents
-- =========================================
CREATE POLICY "Users can read photos for their requests"
ON photos FOR SELECT
TO authenticated
USING (
  work_request_id IN (
    SELECT id FROM work_requests
    WHERE manager_id IN (
      SELECT id FROM property_managers WHERE user_id = auth.uid()
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can upload photos"
ON photos FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
);

CREATE POLICY "Users can read documents for their requests"
ON documents FOR SELECT
TO authenticated
USING (
  work_request_id IN (
    SELECT id FROM work_requests
    WHERE manager_id IN (
      SELECT id FROM property_managers WHERE user_id = auth.uid()
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can upload documents"
ON documents FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
);

-- =========================================
-- POLICIES: status_history
-- =========================================
CREATE POLICY "Users can read status history for their requests"
ON status_history FOR SELECT
TO authenticated
USING (
  work_request_id IN (
    SELECT id FROM work_requests
    WHERE manager_id IN (
      SELECT id FROM property_managers WHERE user_id = auth.uid()
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =========================================
-- STORAGE BUCKETS
-- =========================================
-- À créer dans l'interface Supabase:
-- 1. Bucket "photos" (public)
-- 2. Bucket "documents" (private)

-- Exemple de policies pour Storage (à exécuter séparément):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
