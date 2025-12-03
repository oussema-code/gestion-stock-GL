# 🎯 DÉMARRAGE RAPIDE - 3 MINUTES

## ⚡ ÉTAPES À SUIVRE MAINTENANT

### 1️⃣ Installer les dépendances (30 secondes)
```bash
npm install
```

### 2️⃣ Configurer la base de données (2 minutes)

**Allez sur** : https://app.supabase.com/project/wdrzauagihnutcvofofh/sql/new

**Exécutez ces 3 fichiers dans l'ordre** :

1. **Créer les tables** :
   - Ouvrez `supabase/01_schema.sql`
   - Copiez TOUT le contenu
   - Collez dans SQL Editor de Supabase
   - Cliquez **Run** (Ctrl+Enter)
   - ✅ Attendez "Success"

2. **Créer les triggers** :
   - Ouvrez `supabase/02_triggers.sql`
   - Copiez TOUT
   - Collez dans SQL Editor
   - Cliquez **Run**
   - ✅ Attendez "Success"

3. **Activer la sécurité** :
   - Ouvrez `supabase/03_rls_policies.sql`
   - Copiez TOUT
   - Collez dans SQL Editor
   - Cliquez **Run**
   - ✅ Attendez "Success"

4. **OPTIONNEL - Données de test** :
   - Ouvrez `supabase/04_seed_data.sql`
   - Copiez TOUT
   - Collez dans SQL Editor
   - Cliquez **Run**

### 3️⃣ Démarrer l'application (10 secondes)
```bash
npm run dev
```

**Ouvrez** : http://localhost:5173

---

## ✅ C'EST TOUT !

Votre application fonctionne maintenant avec :
- ✅ Interface React complète
- ✅ Base de données PostgreSQL
- ✅ API Supabase configurée
- ✅ Authentification prête

---

## 📝 POUR CRÉER UN UTILISATEUR

**Après avoir démarré l'app** :

1. Allez sur : https://app.supabase.com/project/wdrzauagihnutcvofofh/auth/users
2. Cliquez **Add user** > **Create new user**
3. Email : `admin@example.com`
4. Password : `admin123456`
5. ✅ Cochez **Auto Confirm User**
6. Cliquez **Create user**

7. **Définir comme admin** (dans SQL Editor) :
```sql
-- Trouver l'ID
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Copier l'UUID et remplacer ci-dessous
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'UUID_ICI';
```

---

## ❌ IGNORER LES ERREURS

Les erreurs dans `supabase/functions/` sont **NORMALES**.

Ces fichiers ne sont **PAS utilisés** par votre app.

Concentrez-vous sur :
- ✅ `src/` - Votre code React
- ✅ `supabase/*.sql` - Scripts de base de données

---

## 📚 DOCUMENTATION

- **BACKEND_FINAL_GUIDE.md** - Guide complet backend
- **FIX_ERRORS.md** - Si vous avez des problèmes

---

## 🎉 PRÊT À CODER !

Votre stack complet est fonctionnel :
- Frontend : React + Vite + Tailwind
- Backend : Supabase (PostgreSQL + Auth + Realtime)
- API : Prête dans `src/lib/supabase.ts`
