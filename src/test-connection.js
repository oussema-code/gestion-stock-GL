// Quick test to verify Supabase connection
// Open browser console (F12) and run this

import { supabase, productsAPI } from './lib/supabase';

console.log('=== SUPABASE CONNECTION TEST ===');
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Test 1: Fetch products
async function testProducts() {
  console.log('\n📦 Testing Products API...');
  const { data, error } = await productsAPI.getAll();
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Success! Found', data?.length || 0, 'products');
    if (data && data.length > 0) {
      console.log('First product:', data[0]);
    }
  }
}

// Test 2: Check auth tables
async function testTables() {
  console.log('\n🗄️ Testing Database Tables...');
  
  const tables = ['products', 'user_profiles', 'suppliers', 'purchase_orders'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ ${table}:`, error.message);
    } else {
      console.log(`✅ ${table}: Table exists`);
    }
  }
}

// Run tests
window.testSupabase = async () => {
  await testProducts();
  await testTables();
  console.log('\n=== TEST COMPLETE ===');
};

console.log('\n💡 Run window.testSupabase() in console to test connection');

export { testProducts, testTables };
