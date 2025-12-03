# 🚀 Guide de Démarrage du Backend ERP Supabase

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :
- ✅ Un compte Supabase (gratuit sur supabase.com)
- ✅ Node.js 16+ installé
- ✅ npm ou yarn installé

## 🎯 Étape 1 : Installation des Dépendances

```bash
# Installer les dépendances du projet
npm install

# Cela va installer @supabase/supabase-js et toutes les autres dépendances
```

## 🗄️ Étape 2 : Configuration de la Base de Données

### 2.1 Accéder à Supabase Dashboard
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (menu de gauche)

### 2.2 Exécuter les Scripts SQL dans l'ordre

**Important** : Exécutez ces scripts **dans l'ordre** :

#### Script 1 : Schema (Tables et Structure)
```bash
# Copiez le contenu du fichier : supabase/01_schema.sql
# Collez-le dans le SQL Editor de Supabase
# Cliquez sur "Run" ou Ctrl+Enter
```

Ce script crée :
- ✅ 11 tables (products, stock_movements, purchase_orders, etc.)
- ✅ Types ENUM (roles, statuts)
- ✅ Index pour les performances
- ✅ Contraintes de données

#### Script 2 : Triggers (Logique Automatique)
```bash
# Copiez le contenu du fichier : supabase/02_triggers.sql
# Collez-le dans le SQL Editor
# Cliquez sur "Run"
```

Ce script crée :
- ✅ Auto-création du profil utilisateur
- ✅ Mise à jour automatique du stock
- ✅ Alertes de stock bas automatiques
- ✅ Calcul automatique des totaux
- ✅ Audit logging

#### Script 3 : RLS Policies (Sécurité)
```bash
# Copiez le contenu du fichier : supabase/03_rls_policies.sql
# Collez-le dans le SQL Editor
# Cliquez sur "Run"
```

Ce script active :
- ✅ Row Level Security sur toutes les tables
- ✅ Permissions par rôle (admin, manager, employee)
- ✅ Protection des données sensibles

#### Script 4 : Seed Data (Données de Test) - OPTIONNEL
```bash
# Copiez le contenu du fichier : supabase/04_seed_data.sql
# Collez-le dans le SQL Editor
# Cliquez sur "Run"
```

Ce script insère :
- ✅ 5 fournisseurs
- ✅ 8 produits (dont 2 en stock bas)
- ✅ 5 clients
- ✅ Mouvements de stock pour tester les alertes

### 2.3 Vérifier l'Installation

Après avoir exécuté tous les scripts :

```sql
-- Vérifiez que toutes les tables sont créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Vous devriez voir 11 tables
```

## 🔔 Étape 3 : Activer Realtime

1. Dans Supabase Dashboard, allez dans **Database** → **Replication**
2. Activez la réplication pour ces tables (cliquez sur le toggle) :
   - ✅ `stock_alerts`
   - ✅ `notifications`
   - ✅ `purchase_orders`
   - ✅ `stock_movements`

Cela permet de recevoir des mises à jour en temps réel dans le frontend.

## 🔑 Étape 4 : Variables d'Environnement

Le fichier `.env` a déjà été créé avec vos credentials :

```env
VITE_SUPABASE_URL=https://wdrzauagihnutcvofofh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**✅ C'est déjà configuré !**

## 🚀 Étape 5 : Démarrer le Projet

```bash
# Terminal 1 : Démarrer le frontend
npm run dev

# Le projet sera accessible sur http://localhost:5173
```

## 👤 Étape 6 : Créer le Premier Utilisateur

### Option A : Via l'Interface Supabase (Recommandé)

1. Allez dans **Authentication** → **Users** dans Supabase Dashboard
2. Cliquez sur **Add user** → **Create new user**
3. Remplissez :
   - Email : `admin@example.com`
   - Password : `admin123456`
   - Auto Confirm User : ✅ Activé
4. Cliquez sur **Create user**

5. **Important** : Définir le rôle admin
   - Allez dans **SQL Editor**
   - Exécutez cette requête (remplacez l'UUID par celui de votre utilisateur) :

```sql
-- Trouver l'ID de l'utilisateur
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Mettre à jour le rôle (remplacez UUID_ICI par l'ID trouvé)
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'UUID_ICI';
```

### Option B : Via Code (Inscription)

Créez un composant de login/signup dans votre frontend et utilisez l'API Supabase.

## 🧪 Étape 7 : Tester le Backend

### Test 1 : Connexion
```typescript
import { auth } from './lib/supabase';

const result = await auth.signIn('admin@example.com', 'admin123456');
console.log('Logged in:', result.data?.user);
```

### Test 2 : Récupérer les Produits
```typescript
import { productsAPI } from './lib/supabase';

const { data, error } = await productsAPI.getAll();
console.log('Products:', data);
```

### Test 3 : Alertes de Stock Bas
```typescript
import { stockAPI } from './lib/supabase';

const { data, error } = await stockAPI.getAlerts(true); // unresolved only
console.log('Low stock alerts:', data);
```

### Test 4 : Realtime
```typescript
import { realtime } from './lib/supabase';

const subscription = realtime.subscribeToStockAlerts((payload) => {
  console.log('New stock alert!', payload.new);
});

// Pour arrêter l'écoute :
// subscription.unsubscribe();
```

## 📊 Étape 8 : Vérifier les Données (si vous avez lancé le seed)

### Dans Supabase Dashboard → Table Editor :

1. **products** : Vous devriez voir 8 produits
2. **suppliers** : Vous devriez voir 5 fournisseurs
3. **customers** : Vous devriez voir 5 clients
4. **stock_alerts** : Devrait contenir 2 alertes (Raw Material X et Component Y)

## 🔧 Dépannage

### Problème : "Row level security policy violation"

**Cause** : Vous n'êtes pas connecté ou n'avez pas les permissions.

**Solution** :
```typescript
// Vérifiez que vous êtes connecté
const { user } = await auth.getCurrentUser();
console.log('Current user:', user);

// Vérifiez le rôle dans user_profiles
```

### Problème : "relation does not exist"

**Cause** : Les tables n'ont pas été créées.

**Solution** : Réexécutez le script `01_schema.sql`

### Problème : Les triggers ne fonctionnent pas

**Cause** : Le script de triggers n'a pas été exécuté.

**Solution** : Exécutez le script `02_triggers.sql`

### Problème : Pas de données après le seed

**Cause** : Le script seed n'a pas été exécuté ou a échoué.

**Solution** :
```sql
-- Vérifiez les données
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM suppliers;

-- Si vide, réexécutez 04_seed_data.sql
```

### Problème : Realtime ne fonctionne pas

**Cause** : La réplication n'est pas activée.

**Solution** : Allez dans Database → Replication et activez les tables mentionnées à l'Étape 3.

## 🎨 Étape 9 : Intégrer avec le Frontend

Le client Supabase est déjà configuré dans `src/lib/supabase.ts`.

### Exemple d'utilisation dans un composant React :

```tsx
import { useEffect, useState } from 'react';
import { stockAPI, realtime } from '../lib/supabase';

function StockAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Charger les alertes
    const loadAlerts = async () => {
      const { data } = await stockAPI.getAlerts(true);
      setAlerts(data || []);
    };

    loadAlerts();

    // Écouter les nouvelles alertes en temps réel
    const subscription = realtime.subscribeToStockAlerts((payload) => {
      setAlerts(prev => [payload.new, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      {alerts.map(alert => (
        <div key={alert.id}>
          {alert.product.name} - Stock: {alert.product.current_stock}
        </div>
      ))}
    </div>
  );
}
```

## 📚 Documentation Complète

Pour plus de détails :
- `supabase/README.md` : Documentation complète de l'API
- `supabase/ARCHITECTURE.md` : Architecture du système
- `supabase/client-api-examples.ts` : Exemples d'utilisation

## ✅ Checklist de Démarrage

- [ ] Dépendances installées (`npm install`)
- [ ] Script 1 (schema) exécuté dans Supabase
- [ ] Script 2 (triggers) exécuté dans Supabase
- [ ] Script 3 (RLS) exécuté dans Supabase
- [ ] Script 4 (seed) exécuté dans Supabase (optionnel)
- [ ] Realtime activé pour les tables nécessaires
- [ ] Variables d'environnement configurées (.env)
- [ ] Premier utilisateur admin créé
- [ ] Frontend démarré (`npm run dev`)
- [ ] Tests de connexion réussis

## 🎉 Vous êtes prêt !

Le backend est maintenant **100% fonctionnel** avec :
- ✅ Base de données PostgreSQL complète
- ✅ Authentification sécurisée
- ✅ API REST automatique
- ✅ Mises à jour en temps réel
- ✅ Sécurité Row-Level
- ✅ Logique métier automatisée
- ✅ Audit logging

**Commencez à construire votre frontend !** 🚀

## 💡 Prochaines Étapes

1. Intégrer l'authentification dans votre UI
2. Créer des composants pour les modules (Stock, Purchases, CRM)
3. Ajouter des formulaires de création/édition
4. Implémenter le système de notifications
5. Ajouter des dashboards avec des graphiques

Besoin d'aide ? Consultez les fichiers de documentation dans le dossier `supabase/`.
