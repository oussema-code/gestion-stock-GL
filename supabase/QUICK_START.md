# 🚀 Supabase ERP Backend - Quick Reference

## 📁 File Structure

```
supabase/
├── 01_schema.sql              # Database schema (tables, indexes, enums)
├── 02_triggers.sql            # Automated business logic triggers
├── 03_rls_policies.sql        # Row Level Security policies
├── 04_seed_data.sql           # Sample data for testing (optional)
├── database.types.ts          # TypeScript type definitions
├── client-api-examples.ts     # Frontend integration examples
├── README.md                  # Complete documentation
├── QUICK_START.md            # This file
└── functions/                 # Supabase Edge Functions
    ├── get-notifications/
    ├── mark-notification-read/
    ├── get-stock-alerts/
    ├── update-stock/
    └── create-purchase-request/
```

## ⚡ Quick Setup (10 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```sql
-- In Supabase SQL Editor (https://app.supabase.com), run in order:
-- 1. 01_schema.sql       (Creates tables, enums, indexes)
-- 2. 02_triggers.sql     (Creates automated business logic)
-- 3. 03_rls_policies.sql (Enables security policies)
-- 4. 04_seed_data.sql    (OPTIONAL: Sample data for testing)

-- After running all scripts, verify with:
-- verify_installation.sql
```

### 3. Enable Realtime
In Supabase Dashboard → Database → Replication, enable:
- ✅ stock_alerts
- ✅ notifications
- ✅ purchase_orders
- ✅ stock_movements

### 4. Environment Variables (Already Configured!)
Your `.env` file is already set up with:
```env
VITE_SUPABASE_URL=https://wdrzauagihnutcvofofh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Create First User (Admin)
In Supabase Dashboard → Authentication → Users:
1. Click "Add user" → "Create new user"
2. Email: `admin@example.com`
3. Password: `admin123456`
4. Auto Confirm User: ✅ Enabled
5. Click "Create user"

Then set role to admin in SQL Editor:
```sql
-- Find user ID
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Set role (replace UUID with actual user ID)
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'UUID_HERE';
```

### 6. Start the Application
```bash
npm run dev
# Open http://localhost:5173
```

## 🎯 Key Features

### ✅ Authentication
- Email/password login
- Magic link authentication
- Role-based access (admin, manager, employee)
- Auto-create user profile on signup

### ✅ Stock Management
- Real-time inventory tracking
- Automated low-stock alerts
- Stock movement history
- Multi-location support

### ✅ Purchase Management
- Purchase request workflow
- Purchase order creation
- Auto-request from critical alerts
- Supplier management

### ✅ CRM
- Customer database
- Interaction tracking
- Sales order management
- Customer history

### ✅ Notifications
- Real-time notifications
- Priority-based alerts
- Email notifications (configurable)
- In-app notification center

## 📊 Database Tables

| Table | Description |
|-------|-------------|
| `user_profiles` | User information and roles |
| `products` | Product catalog |
| `suppliers` | Supplier database |
| `stock_movements` | Inventory transactions |
| `stock_alerts` | Low stock notifications |
| `purchase_requests` | Internal purchase requests |
| `purchase_orders` | Supplier orders |
| `customers` | Customer database |
| `sales_orders` | Customer orders |
| `notifications` | User notifications |
| `audit_logs` | Change tracking |

## 🔒 User Roles & Permissions

### Admin
- ✅ Full system access
- ✅ Manage users and roles
- ✅ View audit logs
- ✅ Delete records

### Manager
- ✅ Manage inventory
- ✅ Approve purchase requests
- ✅ Create purchase/sales orders
- ✅ Manage customers and suppliers
- ❌ Cannot delete critical records

### Employee
- ✅ View inventory
- ✅ Create purchase requests
- ✅ Create sales orders (own)
- ✅ View customers
- ❌ Cannot modify system data

## 🔥 Essential API Calls

```typescript
// Authentication
await signIn('email@example.com', 'password')

// Get products with low stock
await getProducts({ lowStockOnly: true })

// Update stock (add 100 units)
await updateStock({
  product_id: 'xxx',
  movement_type: 'in',
  quantity: 100
})

// Get unresolved alerts
await getStockAlerts(true)

// Create purchase request
await createPurchaseRequest({
  product_id: 'xxx',
  quantity: 200,
  urgency: 'high'
})

// Subscribe to real-time alerts
subscribeToStockAlerts((payload) => {
  console.log('New alert:', payload.new)
})
```

## 🔄 Business Logic Flow

### Low Stock Alert Flow
```
Stock Movement (OUT) 
  → Trigger: update_product_stock
  → Product.current_stock updated
  → Trigger: check_low_stock_alert
  → If < min_stock: Create stock_alert
  → If critical: Auto-create purchase_request
  → Send notifications to managers
  → Realtime event to frontend
```

### Purchase Flow
```
Stock Alert
  → Employee creates purchase_request
  → Manager approves request
  → Manager creates purchase_order
  → Goods received
  → Stock Movement (IN)
  → Stock updated
  → Alert resolved
```

### Sales Flow
```
Customer places order
  → Create sales_order
  → Create sales_order_items
  → For each item: Stock Movement (OUT)
  → Stock updated
  → If low stock: Alert created
```

## 🎨 Frontend Integration

### Install
```bash
npm install @supabase/supabase-js
```

### Initialize
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Use
```typescript
import { supabase } from './lib/supabase'

// Query
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)

// Realtime
supabase
  .channel('alerts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'stock_alerts' },
    (payload) => console.log(payload)
  )
  .subscribe()
```

## 🧪 Test Data

Sample data includes:
- 5 suppliers
- 8 products (2 with low stock)
- 5 customers
- Stock movements that trigger alerts

## 🚨 Common Issues

### RLS Error
**Problem**: "Row level security policy violation"
**Solution**: Ensure user is authenticated and has correct role

### Function Error
**Problem**: Edge function returns 401
**Solution**: Check Authorization header is passed correctly

### Realtime Not Working
**Problem**: Not receiving real-time updates
**Solution**: 
1. Enable replication for the table
2. Check subscription filter
3. Verify user has SELECT permission

## 📞 Need Help?

1. Check `README.md` for detailed documentation
2. Review `client-api-examples.ts` for usage examples
3. Check Supabase logs in Dashboard
4. Review RLS policies if permission denied

## 🎉 You're Ready!

The backend is production-ready with:
- ✅ Secure authentication
- ✅ Role-based access control
- ✅ Automated business logic
- ✅ Real-time updates
- ✅ Audit logging
- ✅ Complete API

Start building your frontend! 🚀
