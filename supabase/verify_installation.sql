-- 🔍 Script de Vérification du Backend ERP
-- Exécutez ce script dans Supabase SQL Editor pour vérifier l'installation

-- ============================================
-- 1. VÉRIFIER LES TABLES
-- ============================================
SELECT 
  '✅ Tables créées' as status,
  COUNT(*) as nombre_tables
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- Liste des tables (devrait être 11)
SELECT 
  table_name as "📋 Tables"
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- 2. VÉRIFIER LES TRIGGERS
-- ============================================
SELECT 
  '✅ Triggers créés' as status,
  COUNT(*) as nombre_triggers
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Liste des triggers (devrait être 6+)
SELECT 
  trigger_name as "⚡ Triggers",
  event_object_table as "Table"
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 3. VÉRIFIER RLS (Row Level Security)
-- ============================================
SELECT 
  tablename as "🔒 Tables avec RLS",
  rowsecurity as "RLS Activé"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Compter les policies (devrait être 30+)
SELECT 
  '✅ RLS Policies' as status,
  COUNT(*) as nombre_policies
FROM pg_policies
WHERE schemaname = 'public';

-- ============================================
-- 4. VÉRIFIER LES FONCTIONS
-- ============================================
SELECT 
  routine_name as "🔧 Fonctions"
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- ============================================
-- 5. VÉRIFIER LES DONNÉES (si seed exécuté)
-- ============================================
SELECT 
  '📊 Produits' as table_name,
  COUNT(*) as nombre_lignes
FROM products
UNION ALL
SELECT 
  '📊 Fournisseurs',
  COUNT(*)
FROM suppliers
UNION ALL
SELECT 
  '📊 Clients',
  COUNT(*)
FROM customers
UNION ALL
SELECT 
  '📊 Alertes Stock',
  COUNT(*)
FROM stock_alerts
UNION ALL
SELECT 
  '📊 Mouvements Stock',
  COUNT(*)
FROM stock_movements;

-- ============================================
-- 6. VÉRIFIER LES PRODUITS EN STOCK BAS
-- ============================================
SELECT 
  name as "⚠️ Produits en Stock Bas",
  current_stock as "Stock Actuel",
  min_stock as "Stock Minimum",
  (min_stock - current_stock) as "Manque"
FROM products
WHERE current_stock < min_stock
  AND is_active = true
ORDER BY (min_stock - current_stock) DESC;

-- ============================================
-- 7. VÉRIFIER LES ALERTES ACTIVES
-- ============================================
SELECT 
  sa.id,
  p.name as "🔔 Produit",
  sa.priority as "Priorité",
  sa.shortage_quantity as "Manque",
  sa.created_at as "Créée le"
FROM stock_alerts sa
JOIN products p ON sa.product_id = p.id
WHERE sa.resolved_at IS NULL
ORDER BY 
  CASE sa.priority 
    WHEN 'critical' THEN 1 
    WHEN 'high' THEN 2 
    WHEN 'medium' THEN 3 
    ELSE 4 
  END,
  sa.created_at DESC;

-- ============================================
-- 8. VÉRIFIER LES UTILISATEURS
-- ============================================
SELECT 
  up.id,
  up.email as "👤 Email",
  up.role as "Rôle",
  up.full_name as "Nom",
  up.created_at as "Créé le"
FROM user_profiles up
ORDER BY up.created_at DESC;

-- ============================================
-- 9. VÉRIFIER LES INDEX
-- ============================================
SELECT 
  tablename as "Table",
  indexname as "📇 Index"
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;

-- ============================================
-- 10. RÉSUMÉ FINAL
-- ============================================
SELECT 
  '🎯 RÉSUMÉ DE VÉRIFICATION' as "═══════════════════════════════";

SELECT 
  'Tables' as "Composant",
  COUNT(*)::text as "Nombre",
  CASE 
    WHEN COUNT(*) >= 11 THEN '✅ OK'
    ELSE '❌ MANQUANT'
  END as "Statut"
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
  'Triggers',
  COUNT(*)::text,
  CASE 
    WHEN COUNT(*) >= 6 THEN '✅ OK'
    ELSE '❌ MANQUANT'
  END
FROM information_schema.triggers 
WHERE trigger_schema = 'public'

UNION ALL

SELECT 
  'RLS Policies',
  COUNT(*)::text,
  CASE 
    WHEN COUNT(*) >= 30 THEN '✅ OK'
    ELSE '❌ MANQUANT'
  END
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Fonctions',
  COUNT(*)::text,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ OK'
    ELSE '❌ MANQUANT'
  END
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION';

-- ============================================
-- 11. TEST DES TRIGGERS (OPTIONNEL)
-- ============================================
-- Décommentez pour tester si les triggers fonctionnent

/*
-- Test 1 : Créer un mouvement de stock et vérifier la mise à jour
DO $$
DECLARE
  test_product_id UUID;
  old_stock INT;
  new_stock INT;
BEGIN
  -- Récupérer un produit de test
  SELECT id, current_stock INTO test_product_id, old_stock
  FROM products
  LIMIT 1;
  
  -- Créer un mouvement
  INSERT INTO stock_movements (product_id, movement_type, quantity)
  VALUES (test_product_id, 'in', 10);
  
  -- Vérifier la mise à jour
  SELECT current_stock INTO new_stock
  FROM products
  WHERE id = test_product_id;
  
  IF new_stock = old_stock + 10 THEN
    RAISE NOTICE '✅ Test Trigger Stock : RÉUSSI (% -> %)', old_stock, new_stock;
  ELSE
    RAISE NOTICE '❌ Test Trigger Stock : ÉCHOUÉ';
  END IF;
END $$;
*/

-- ============================================
-- MESSAGE FINAL
-- ============================================
SELECT 
  '🎉 VÉRIFICATION TERMINÉE!' as "════════════════════════════════",
  'Si tous les statuts sont ✅ OK, votre backend est prêt!' as "Message";
