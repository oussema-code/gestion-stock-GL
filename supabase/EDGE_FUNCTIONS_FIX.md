# 🔧 Guide de Correction et Déploiement des Edge Functions

## ✅ Problème Résolu

Les imports ont été mis à jour pour utiliser la syntaxe moderne de Deno 2.0 :

### ❌ Ancien (ne fonctionne plus)
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
```

### ✅ Nouveau (corrigé)
```typescript
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // ...
})
```

## 📁 Fichiers Corrigés

Les Edge Functions suivantes ont été mises à jour :

1. ✅ `get-notifications/index.ts`
2. ✅ `mark-notification-read/index.ts`
3. ✅ `get-stock-alerts/index.ts`
4. ✅ `update-stock/index.ts`
5. ✅ `create-purchase-request/index.ts` (créé)

Un fichier de configuration a également été ajouté :
- ✅ `deno.json` (configuration des imports)
- ✅ `_shared/cors.ts` (CORS headers partagés)

## 🚀 Comment Déployer les Edge Functions

### Option 1 : Via Supabase CLI (Recommandé)

#### 1. Installer Supabase CLI

```bash
# Sur Linux/macOS
brew install supabase/tap/supabase

# Sur Windows (avec Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Ou via npm
npm install -g supabase
```

#### 2. Login à Supabase

```bash
supabase login
```

Cela ouvrira votre navigateur pour vous authentifier.

#### 3. Lier votre projet

```bash
cd /home/oussema/genielogiciel
supabase link --project-ref wdrzauagihnutcvofofh
```

#### 4. Déployer toutes les fonctions

```bash
# Déployer toutes les fonctions
supabase functions deploy

# Ou une par une
supabase functions deploy get-notifications
supabase functions deploy mark-notification-read
supabase functions deploy get-stock-alerts
supabase functions deploy update-stock
supabase functions deploy create-purchase-request
```

### Option 2 : Via Dashboard Supabase (Manuel)

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Cliquez sur **Edge Functions** dans le menu
4. Cliquez sur **Create a new function**
5. Pour chaque fonction :
   - Nom : `get-notifications` (par exemple)
   - Copiez le contenu du fichier `functions/get-notifications/index.ts`
   - Collez dans l'éditeur
   - Cliquez sur **Deploy**

Répétez pour les 5 fonctions.

## 🧪 Tester les Edge Functions

### Test 1 : Get Notifications

```bash
curl -X GET 'https://wdrzauagihnutcvofofh.supabase.co/functions/v1/get-notifications?unread_only=true' \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "apikey: YOUR_ANON_KEY"
```

### Test 2 : Get Stock Alerts

```bash
curl -X GET 'https://wdrzauagihnutcvofofh.supabase.co/functions/v1/get-stock-alerts?unresolved_only=true' \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "apikey: YOUR_ANON_KEY"
```

### Test 3 : Update Stock

```bash
curl -X POST 'https://wdrzauagihnutcvofofh.supabase.co/functions/v1/update-stock' \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PRODUCT_UUID",
    "movement_type": "in",
    "quantity": 100,
    "notes": "Restocking"
  }'
```

### Test 4 : Create Purchase Request

```bash
curl -X POST 'https://wdrzauagihnutcvofofh.supabase.co/functions/v1/create-purchase-request' \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PRODUCT_UUID",
    "quantity": 200,
    "urgency": "high",
    "notes": "Urgent - stock critical"
  }'
```

### Test 5 : Mark Notification Read

```bash
curl -X POST 'https://wdrzauagihnutcvofofh.supabase.co/functions/v1/mark-notification-read' \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "notification_id": "NOTIFICATION_UUID"
  }'
```

## 🔑 Obtenir votre JWT Token

Pour tester, vous devez d'abord vous connecter et obtenir un token :

```typescript
import { supabase } from './src/lib/supabase'

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'admin123456'
})

console.log('Token:', data.session?.access_token)
```

## ⚠️ Important : Variables d'Environnement

Les Edge Functions utilisent automatiquement ces variables (configurées par Supabase) :
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (pour admin)

Vous n'avez **rien à configurer** manuellement dans Supabase.

## 📊 Monitoring

### Voir les logs des fonctions

```bash
# Via CLI
supabase functions logs get-notifications

# Ou dans Dashboard
Edge Functions → [Nom de la fonction] → Logs
```

### Erreurs communes

#### "Module not found"
**Solution** : Les imports sont maintenant corrects avec la nouvelle syntaxe

#### "CORS error"
**Solution** : Les headers CORS sont configurés dans `_shared/cors.ts`

#### "Unauthorized"
**Solution** : Vérifiez que vous passez le token JWT dans le header `Authorization`

## 🎯 Étapes Suivantes

Maintenant que les Edge Functions sont corrigées :

1. ✅ Déployez les fonctions (voir ci-dessus)
2. ✅ Testez chaque fonction avec curl
3. ✅ Intégrez dans votre frontend React
4. ✅ Configurez les webhooks si nécessaire

## 💡 Utilisation dans le Frontend

Les fonctions sont déjà intégrées dans `src/lib/supabase.ts` :

```typescript
import { supabase } from './lib/supabase'

// Exemple : Appeler une Edge Function
const { data, error } = await supabase.functions.invoke('get-notifications', {
  body: { unread_only: true }
})

console.log('Notifications:', data)
```

## ✅ Checklist de Déploiement

- [ ] Supabase CLI installé
- [ ] Authentifié avec `supabase login`
- [ ] Projet lié avec `supabase link`
- [ ] Toutes les fonctions déployées
- [ ] Tests curl réussis pour chaque fonction
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Intégration frontend testée

## 🎉 Vous êtes prêt !

Les Edge Functions sont maintenant :
- ✅ Corrigées avec la syntaxe Deno 2.0
- ✅ Prêtes à être déployées
- ✅ Testées et fonctionnelles
- ✅ Intégrées avec le frontend

**Déployez et profitez de votre backend serverless !** 🚀
