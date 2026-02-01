-- =====================================================
-- CORRIGER TOUTES LES POLITIQUES RLS - MrBrico Immo
-- Copie ce SQL dans Supabase > SQL Editor et clique Run
-- =====================================================

-- 1. USERS: Permettre aux utilisateurs authentifiés de lire leur profil
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- 2. PROPERTY_MANAGERS: Permettre aux utilisateurs de lire leur property_manager
DROP POLICY IF EXISTS "Users can read own property manager" ON property_managers;
CREATE POLICY "Users can read own property manager" ON property_managers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 3. WORK_REQUESTS: Corriger les policies de visualisation et création
DROP POLICY IF EXISTS "Managers can view own requests" ON work_requests;
DROP POLICY IF EXISTS "Managers can create requests" ON work_requests;

CREATE POLICY "Managers can view own requests" ON work_requests
  FOR SELECT TO authenticated
  USING (
    manager_id IN (SELECT id FROM property_managers WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Managers can create requests" ON work_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    manager_id IN (SELECT id FROM property_managers WHERE user_id = auth.uid())
  );

-- 4. BUILDINGS: Corriger les policies
DROP POLICY IF EXISTS "Managers can view own buildings" ON buildings;
DROP POLICY IF EXISTS "Managers can manage own buildings" ON buildings;

CREATE POLICY "Managers can view own buildings" ON buildings
  FOR SELECT TO authenticated
  USING (
    manager_id IN (SELECT id FROM property_managers WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Managers can manage own buildings" ON buildings
  FOR ALL TO authenticated
  USING (
    manager_id IN (SELECT id FROM property_managers WHERE user_id = auth.uid())
  )
  WITH CHECK (
    manager_id IN (SELECT id FROM property_managers WHERE user_id = auth.uid())
  );
