# 🎯 BACKEND SETUP - GUIDE SIMPLE ET COMPLET

## ✅ Ce qui est configuré :

### 1. Variables d'environnement (`.env`)
```
VITE_SUPABASE_URL=https://wdrzauagihnutcvofofh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Client Supabase (`src/lib/supabase.ts`)
- ✅ Connexion à Supabase configurée
- ✅ API complète pour tous les modules
- ✅ Fonctions d'authentification
- ✅ Realtime subscriptions

---

## 🚀 COMMENT DÉMARRER (5 ÉTAPES SIMPLES)

### ÉTAPE 1 : Installer les dépendances
```bash
npm install
```

### ÉTAPE 2 : Configurer la base de données dans Supabase

1. **Allez sur** : https://app.supabase.com/project/wdrzauagihnutcvofofh
2. **Cliquez sur "SQL Editor"** (menu de gauche)
3. **Exécutez ces 4 scripts dans l'ordre** :

#### A. Créer les tables
```bash
# Ouvrez : supabase/01_schema.sql
# Copiez TOUT → Collez dans SQL Editor → Run
# ✅ Attendez "Success"
```

#### B. Créer les triggers
```bash
# Ouvrez : supabase/02_triggers.sql
# Copiez TOUT → Collez dans SQL Editor → Run
# ✅ Attendez "Success"
```

#### C. Activer la sécurité
```bash
# Ouvrez : supabase/03_rls_policies.sql
# Copiez TOUT → Collez dans SQL Editor → Run
# ✅ Attendez "Success"
```

#### D. Ajouter des données de test (OPTIONNEL)
```bash
# Ouvrez : supabase/04_seed_data.sql
# Copiez TOUT → Collez dans SQL Editor → Run
# ✅ Attendez "Success"
```

### ÉTAPE 3 : Activer Realtime

1. Dans Supabase Dashboard → **Database** → **Replication**
2. Activez (toggle ON) ces tables :
   - ✅ `stock_alerts`
   - ✅ `notifications`
   - ✅ `purchase_orders`
   - ✅ `stock_movements`

### ÉTAPE 4 : Créer un utilisateur Admin

1. Dans Supabase → **Authentication** → **Users**
2. **Add user** → **Create new user**
3. Email: `admin@example.com`
4. Password: `admin123456`
5. ✅ Cochez "Auto Confirm User"
6. **Create user**

7. **Définir comme Admin** (retournez dans SQL Editor) :
```sql
-- 1. Trouver l'ID de l'utilisateur
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- 2. Copier l'UUID et l'utiliser ici (remplacer VOTRE_USER_ID)
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'VOTRE_USER_ID';
```

### ÉTAPE 5 : Démarrer l'application
```bash
npm run dev
```

Ouvrez : **http://localhost:5173**

---

## 🎨 UTILISER L'API DANS VOTRE CODE

### Importer le client
```typescript
import { 
  auth, 
  productsAPI, 
  stockAPI, 
  purchaseAPI,
  notificationsAPI,
  realtime 
} from './lib/supabase'
```

### Exemples d'utilisation

#### 1. Se connecter
```typescript
const { data, error } = await auth.signIn('admin@example.com', 'admin123456')
if (data) {
  console.log('Connecté:', data.user)
}
```

#### 2. Récupérer les produits
```typescript
const { data: products } = await productsAPI.getAll()
console.log('Produits:', products)
```

#### 3. Récupérer les alertes de stock bas
```typescript
const { data: alerts } = await stockAPI.getAlerts(true) // unresolved only
console.log('Alertes:', alerts)
```

#### 4. Créer un mouvement de stock
```typescript
const { data } = await stockAPI.updateStock({
  product_id: 'xxx',
  movement_type: 'in',
  quantity: 100,
  notes: 'Réception fournisseur'
})
```

#### 5. Créer une demande d'achat
```typescript
const { data } = await purchaseAPI.createRequest({
  product_id: 'xxx',
  quantity: 200,
  urgency: 'high',
  notes: 'Stock critique'
})
```

#### 6. Écouter les alertes en temps réel
```typescript
const subscription = realtime.subscribeToStockAlerts((payload) => {
  console.log('Nouvelle alerte!', payload.new)
  // Mettez à jour votre UI ici
})

// Pour arrêter l'écoute :
subscription.unsubscribe()
```

---

## 📋 API COMPLÈTE DISPONIBLE

### `auth`
- `signIn(email, password)` - Connexion
- `signUp(email, password, fullName)` - Inscription
- `signOut()` - Déconnexion
- `getCurrentUser()` - Utilisateur actuel
- `onAuthStateChange(callback)` - Écouter les changements

### `productsAPI`
- `getAll(filters?)` - Liste des produits
- `getById(id)` - Détail d'un produit
- `create(product)` - Créer un produit
- `update(id, updates)` - Mettre à jour

### `stockAPI`
- `getMovements(productId?, limit)` - Historique des mouvements
- `updateStock(movement)` - Créer un mouvement
- `getAlerts(unresolvedOnly)` - Récupérer les alertes
- `resolveAlert(alertId)` - Marquer comme résolu

### `purchaseAPI`
- `getRequests(status?)` - Demandes d'achat
- `createRequest(request)` - Créer une demande
- `approveRequest(requestId)` - Approuver
- `getOrders(status?)` - Bons de commande
- `createOrder(order)` - Créer un bon

### `notificationsAPI`
- `getAll(unreadOnly)` - Récupérer les notifications
- `markAsRead(notificationId)` - Marquer comme lu
- `markAllAsRead()` - Tout marquer comme lu

### `customerAPI`
- `getAll()` - Liste des clients
- `getById(id)` - Détail d'un client
- `create(customer)` - Créer un client

### `salesAPI`
- `getOrders(customerId?)` - Commandes clients
- `createOrder(order)` - Créer une commande

### `realtime`
- `subscribeToStockAlerts(callback)` - Écouter alertes stock
- `subscribeToNotifications(userId, callback)` - Écouter notifications
- `subscribeToPurchaseOrders(callback)` - Écouter achats

---

## ✅ VÉRIFICATION

### Vérifier que tout fonctionne :

1. **Tables créées** : Supabase → Table Editor → Voir 11 tables
2. **Données insérées** : Table `products` → 8 produits
3. **Connexion OK** : Dans console navigateur :
```javascript
const { data } = await auth.signIn('admin@example.com', 'admin123456')
console.log(data)
```

---

## 🔥 EDGE FUNCTIONS (OPTIONNEL - Avancé)

Les Edge Functions ne sont **PAS nécessaires** pour commencer !

Toutes les fonctionnalités marchent directement avec le client Supabase :
- ✅ CRUD sur toutes les tables
- ✅ Authentification
- ✅ Realtime
- ✅ RLS (sécurité)
- ✅ Triggers automatiques

**Les Edge Functions sont utiles pour** :
- Logique métier complexe côté serveur
- Intégrations tierces (email, paiement, etc.)
- Webhooks
- Tâches planifiées

---

## 📚 FICHIERS IMPORTANTS

- **`.env`** - Variables d'environnement (déjà configuré ✅)
- **`src/lib/supabase.ts`** - Client API (déjà configuré ✅)
- **`supabase/01_schema.sql`** - Schéma base de données
- **`supabase/02_triggers.sql`** - Logique automatique
- **`supabase/03_rls_policies.sql`** - Sécurité
- **`supabase/04_seed_data.sql`** - Données de test

---

## 🎉 C'EST TOUT !

Votre backend est **100% fonctionnel** sans Edge Functions.

**Commencez à coder votre UI !** 🚀
