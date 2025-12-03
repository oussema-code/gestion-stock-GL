// Test simple pour vérifier que Supabase fonctionne
// Ouvrez la console du navigateur (F12) et collez ce code

import { auth, productsAPI, stockAPI } from './lib/supabase';

// Test 1: Vérifier la connexion Supabase
console.log('🔍 Test 1: Configuration Supabase');
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key configurée:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Oui' : '❌ Non');

// Test 2: Se connecter
console.log('\n🔍 Test 2: Connexion utilisateur');
const loginResult = await auth.signIn('admin@example.com', 'admin123456');
if (loginResult.data?.user) {
  console.log('✅ Connecté:', loginResult.data.user.email);
  console.log('User ID:', loginResult.data.user.id);
} else {
  console.log('❌ Erreur:', loginResult.error);
}

// Test 3: Récupérer les produits
console.log('\n🔍 Test 3: Récupérer les produits');
const { data: products, error: productsError } = await productsAPI.getAll();
if (products) {
  console.log('✅ Produits récupérés:', products.length);
  console.log('Premier produit:', products[0]);
} else {
  console.log('❌ Erreur:', productsError);
}

// Test 4: Récupérer les alertes
console.log('\n🔍 Test 4: Alertes de stock');
const { data: alerts, error: alertsError } = await stockAPI.getAlerts(true);
if (alerts) {
  console.log('✅ Alertes récupérées:', alerts.length);
  if (alerts.length > 0) {
    console.log('Première alerte:', alerts[0]);
  }
} else {
  console.log('❌ Erreur:', alertsError);
}

console.log('\n✅ Tests terminés!');
