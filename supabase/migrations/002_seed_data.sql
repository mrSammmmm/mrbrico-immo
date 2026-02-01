-- =========================================
-- MRBRICO IMMO - Données de seed pour tests
-- =========================================
-- ⚠️ À exécuter APRÈS avoir créé les utilisateurs dans Supabase Auth
-- Les IDs doivent correspondre aux utilisateurs créés via l'interface Auth

-- Note: Pour créer les utilisateurs, utiliser l'interface Supabase Auth
-- ou les API endpoints. Ensuite, mettre à jour les IDs ci-dessous.

-- =========================================
-- EXEMPLE: Créer admin et gestionnaire test
-- =========================================

-- 1. D'abord créer les utilisateurs via Supabase Auth Dashboard
--    - sam@monsieurbricole.com (admin)
--    - test@gestion.com (manager)

-- 2. Ensuite, les entrées users seront créées automatiquement
--    par le trigger handle_new_user()

-- 3. Puis exécuter les scripts ci-dessous avec les bons UUIDs

-- =========================================
-- Property Manager (remplacer USER_ID_HERE)
-- =========================================
-- INSERT INTO property_managers (user_id, company_name, contact_email, contact_phone, address)
-- VALUES (
--   'USER_ID_HERE', -- UUID du gestionnaire créé dans Auth
--   'Gestion ABC',
--   'contact@gestionabc.com',
--   '(819) 555-9999',
--   '100 Rue King, Sherbrooke'
-- );

-- =========================================
-- Buildings (remplacer MANAGER_ID_HERE)
-- =========================================
-- INSERT INTO buildings (manager_id, address, city, postal_code, unit_count) VALUES
-- ('MANAGER_ID_HERE', '123 Rue King, Sherbrooke', 'Sherbrooke', 'J1H 1P8', 12),
-- ('MANAGER_ID_HERE', '456 Rue Wellington, Sherbrooke', 'Sherbrooke', 'J1H 5E4', 8),
-- ('MANAGER_ID_HERE', '789 Rue Frontenac, Sherbrooke', 'Sherbrooke', 'J1H 2K1', 16);

-- =========================================
-- Work Request exemple (remplacer les IDs)
-- =========================================
-- INSERT INTO work_requests (
--   request_number,
--   manager_id,
--   building_id,
--   unit_numbers,
--   work_type,
--   work_category,
--   priority,
--   description,
--   access_info,
--   status
-- ) VALUES (
--   '2026-001',
--   'MANAGER_ID_HERE',
--   'BUILDING_ID_HERE',
--   ARRAY['304'],
--   'Fuite d''eau',
--   'plumbing',
--   'urgent',
--   'Fuite importante au plafond de la salle de bain. Dégâts visibles sur le plâtre. Le locataire signale que ça coule depuis 2 jours.',
--   'Locataire présent en journée. Appeler avant. Clé disponible chez le concierge apt 101.',
--   'nouveau'
-- );

-- =========================================
-- Catégories de travaux (référence)
-- =========================================
-- plumbing    = Plomberie
-- electrical  = Électricité
-- renovation  = Rénovation
-- painting    = Peinture
-- flooring    = Plancher
-- hvac        = Chauffage/Climatisation
-- roofing     = Toiture
-- windows     = Fenêtres
-- doors       = Portes
-- general     = Général
-- emergency   = Urgence

-- =========================================
-- Script pour créer un admin manuellement
-- (si le trigger ne fonctionne pas)
-- =========================================
-- INSERT INTO users (id, email, role, full_name, phone)
-- VALUES (
--   'AUTH_USER_UUID',
--   'sam@monsieurbricole.com',
--   'admin',
--   'Sam Gauthier',
--   '(819) 555-0123'
-- );
