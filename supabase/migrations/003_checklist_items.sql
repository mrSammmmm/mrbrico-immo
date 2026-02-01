-- =====================================================
-- TABLE CHECKLIST_ITEMS - MrBrico Immo
-- Liste de tâches pour chaque demande de travaux
-- =====================================================

-- 1. Créer la table checklist_items
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_request_id UUID NOT NULL REFERENCES work_requests(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  item_order INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Index pour améliorer les performances
CREATE INDEX idx_checklist_items_work_request ON checklist_items(work_request_id);
CREATE INDEX idx_checklist_items_completed ON checklist_items(is_completed);

-- 3. Activer RLS
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- 4. Politique: Les gestionnaires peuvent voir les checklist de leurs demandes
DROP POLICY IF EXISTS "Managers can view own checklist items" ON checklist_items;
CREATE POLICY "Managers can view own checklist items" ON checklist_items
  FOR SELECT TO authenticated
  USING (
    work_request_id IN (
      SELECT id FROM work_requests
      WHERE manager_id IN (
        SELECT id FROM property_managers WHERE user_id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Politique: Les gestionnaires peuvent créer/modifier les items de leurs demandes
DROP POLICY IF EXISTS "Managers can manage own checklist items" ON checklist_items;
CREATE POLICY "Managers can manage own checklist items" ON checklist_items
  FOR ALL TO authenticated
  USING (
    work_request_id IN (
      SELECT id FROM work_requests
      WHERE manager_id IN (
        SELECT id FROM property_managers WHERE user_id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    work_request_id IN (
      SELECT id FROM work_requests
      WHERE manager_id IN (
        SELECT id FROM property_managers WHERE user_id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_checklist_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_checklist_items_updated_at ON checklist_items;
CREATE TRIGGER trigger_update_checklist_items_updated_at
  BEFORE UPDATE ON checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_checklist_items_updated_at();

-- 8. Vérification
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'checklist_items'
ORDER BY ordinal_position;
