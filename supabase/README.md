# Supabase ERP Backend - Complete Setup Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Edge Functions Setup](#edge-functions-setup)
5. [Frontend Integration](#frontend-integration)
6. [Security & RLS](#security--rls)
7. [API Documentation](#api-documentation)
8. [Testing](#testing)
9. [Production Deployment](#production-deployment)

---

## 🎯 Overview

This is a complete, production-ready backend for an ERP system built on Supabase, featuring:

- **Authentication**: Email/password + magic link with role-based access (admin, manager, employee)
- **Stock Management**: Real-time inventory tracking with automated alerts
- **Purchase Management**: Request and order workflow
- **CRM**: Customer and sales order management
- **Notifications**: Real-time alerts via Edge Functions and Realtime subscriptions
- **Security**: Row Level Security (RLS) policies on all tables
- **Audit Logging**: Complete change tracking

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│            (Supabase Client + Realtime)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS + Auth JWT
                     │
┌────────────────────▼────────────────────────────────────┐
│                 Supabase Platform                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Auth       │  │  PostgreSQL  │  │    Edge      │ │
│  │   Service    │  │   + RLS      │  │  Functions   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Realtime Subscriptions                    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Prerequisites

- Supabase account (free tier works fine for development)
- Node.js 16+ and npm
- Supabase CLI (optional but recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

---

## 💾 Database Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details
4. Wait for provisioning (2-3 minutes)

### Step 2: Run Database Migrations

Execute the SQL files in order through the Supabase SQL Editor:

#### 1. Schema (01_schema.sql)
```sql
-- Creates all tables, enums, indexes, and sequences
-- Run this first
```

**Tables Created:**
- `user_profiles` - Extended user information
- `products` - Product catalog
- `suppliers` - Supplier management
- `stock_movements` - Inventory transactions
- `stock_alerts` - Low stock notifications
- `purchase_requests` - Internal purchase requests
- `purchase_orders` - Supplier orders
- `customers` - Customer database
- `customer_interactions` - CRM activity log
- `sales_orders` - Customer orders
- `notifications` - User notifications
- `audit_logs` - Change tracking

#### 2. Triggers (02_triggers.sql)
```sql
-- Automated business logic
-- Run this second
```

**Key Triggers:**
- ✅ Auto-update timestamps on record changes
- ✅ Create user profile on signup
- ✅ Update product stock after movements
- ✅ Auto-create stock alerts when stock is low
- ✅ Generate order numbers automatically
- ✅ Calculate order totals
- ✅ Audit log all changes
- ✅ Auto-create purchase requests for critical alerts

#### 3. RLS Policies (03_rls_policies.sql)
```sql
-- Row Level Security policies
-- Run this third
```

**Security Model:**
- **Admin**: Full access to all data
- **Manager**: Read/write access to business modules
- **Employee**: Read-only access, can create own records

#### 4. Seed Data (04_seed_data.sql) - OPTIONAL
```sql
-- Sample data for testing
-- Run this last (optional)
```

### Step 3: Enable Realtime

1. Go to Database → Replication
2. Enable replication for these tables:
   - `stock_alerts`
   - `notifications`
   - `purchase_orders`

---

## ⚡ Edge Functions Setup

### Deploy Edge Functions

```bash
# Navigate to your project
cd supabase/functions

# Deploy each function
supabase functions deploy get-notifications
supabase functions deploy mark-notification-read
supabase functions deploy get-stock-alerts
supabase functions deploy update-stock
supabase functions deploy create-purchase-request
```

### Set Environment Variables

In Supabase Dashboard → Settings → Edge Functions:

```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

### Available Edge Functions

| Function | Method | Description |
|----------|--------|-------------|
| `get-notifications` | POST | Get user notifications with filters |
| `mark-notification-read` | POST | Mark notifications as read |
| `get-stock-alerts` | POST | Get stock alerts with product details |
| `update-stock` | POST | Create stock movement and update inventory |
| `create-purchase-request` | POST | Create purchase request from alert |

---

## 🎨 Frontend Integration

### Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Initialize Supabase Client

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Environment Variables (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Usage Examples

See `client-api-examples.ts` for complete examples. Quick reference:

```typescript
import { 
  signIn, 
  getProducts, 
  updateStock, 
  getStockAlerts,
  createPurchaseRequest,
  subscribeToStockAlerts 
} from './lib/supabase-api'

// Authentication
const { data, error } = await signIn('user@example.com', 'password')

// Get products
const { data: products } = await getProducts({ 
  category: 'raw_materials',
  lowStockOnly: true 
})

// Update stock
await updateStock({
  product_id: 'xxx',
  movement_type: 'in',
  quantity: 100,
  notes: 'Received delivery'
})

// Get alerts
const { data: alerts } = await getStockAlerts()

// Create purchase request
await createPurchaseRequest({
  product_id: 'xxx',
  quantity: 200,
  urgency: 'high',
  reason: 'Low stock'
})

// Subscribe to real-time alerts
const subscription = subscribeToStockAlerts((payload) => {
  console.log('New alert:', payload)
  // Update UI
})
```

---

## 🔒 Security & RLS

### User Roles

```typescript
type UserRole = 'admin' | 'manager' | 'employee'
```

### Permission Matrix

| Resource | Admin | Manager | Employee |
|----------|-------|---------|----------|
| Products | CRUD | CRUD | Read |
| Stock Movements | CRUD | Create, Read | Read |
| Purchase Requests | CRUD | CRUD | Create own, Read own |
| Purchase Orders | CRUD | CRUD | Read |
| Customers | CRUD | CRUD | Read |
| Sales Orders | CRUD | CRUD | Create own |
| Notifications | Read own | Read own | Read own |
| Audit Logs | Read | - | - |

### RLS Helper Functions

```sql
-- Check user role
SELECT public.get_user_role(); -- Returns: 'admin' | 'manager' | 'employee'

-- Check if admin
SELECT public.is_admin(); -- Returns: boolean

-- Check if manager or admin
SELECT public.is_manager_or_admin(); -- Returns: boolean
```

---

## 📚 API Documentation

### Authentication

#### Sign Up
```typescript
await signUp(email, password, fullName, role)
```

#### Sign In
```typescript
await signIn(email, password)
```

#### Magic Link
```typescript
await signInWithMagicLink(email)
```

### Stock Management

#### Get Products
```typescript
await getProducts({
  category?: string,
  search?: string,
  lowStockOnly?: boolean
})
```

#### Update Stock
```typescript
await updateStock({
  product_id: string,
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer',
  quantity: number,
  notes?: string
})
```

#### Get Stock Alerts
```typescript
await getStockAlerts(unresolvedOnly?: boolean)
```

### Purchase Management

#### Create Purchase Request
```typescript
await createPurchaseRequest({
  product_id: string,
  quantity: number,
  urgency?: 'low' | 'medium' | 'high' | 'critical',
  reason?: string,
  stock_alert_id?: string
})
```

#### Approve Purchase Request
```typescript
await approvePurchaseRequest(requestId)
```

#### Create Purchase Order
```typescript
await createPurchaseOrder({
  supplier_id: string,
  items: Array<{
    product_id: string,
    quantity: number,
    unit_price: number
  }>,
  expected_delivery_date?: string
})
```

### CRM

#### Get Customers
```typescript
await getCustomers(activeOnly?: boolean)
```

#### Create Sales Order
```typescript
await createSalesOrder({
  customer_id: string,
  items: Array<{
    product_id: string,
    quantity: number,
    unit_price: number
  }>,
  shipping_address?: string
})
```

### Notifications

#### Get Notifications
```typescript
await getUserNotifications(unreadOnly?: boolean)
```

#### Mark as Read
```typescript
await markNotificationAsRead(notificationId)
await markAllNotificationsAsRead()
```

### Realtime Subscriptions

```typescript
// Stock alerts
const sub1 = subscribeToStockAlerts((payload) => {
  console.log('New alert:', payload.new)
})

// User notifications
const sub2 = await subscribeToNotifications((payload) => {
  console.log('New notification:', payload.new)
})

// Cleanup
sub1.unsubscribe()
sub2?.unsubscribe()
```

---

## 🧪 Testing

### Test User Accounts

Create test users with different roles:

```sql
-- Admin user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@test.com', crypt('password123', gen_salt('bf')), now());

-- Manager user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('manager@test.com', crypt('password123', gen_salt('bf')), now());

-- Employee user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('employee@test.com', crypt('password123', gen_salt('bf')), now());
```

### Test Scenarios

1. **Stock Alert Flow**
   - Create stock OUT movement that drops below minimum
   - Verify alert is created
   - Verify notification is sent
   - Create purchase request from alert

2. **Purchase Flow**
   - Create purchase request
   - Manager approves
   - Create purchase order
   - Receive goods (stock IN movement)

3. **Sales Flow**
   - Create sales order
   - Verify stock is deducted
   - Check if low stock alert is triggered

---

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Enable RLS on all tables
- [ ] Review and test all policies
- [ ] Set up proper indexes
- [ ] Configure auth settings (email templates, redirects)
- [ ] Set up database backups
- [ ] Enable SSL enforcement
- [ ] Configure rate limiting on Edge Functions
- [ ] Set up monitoring and alerts

### Performance Optimization

1. **Database**
   - All critical indexes are included
   - Use connection pooling
   - Enable prepared statements

2. **Edge Functions**
   - Add caching where appropriate
   - Implement rate limiting
   - Monitor cold starts

3. **Realtime**
   - Only subscribe to needed tables
   - Unsubscribe when components unmount
   - Use filters to reduce payload

### Monitoring

Key metrics to monitor:
- API response times
- Database query performance
- Edge Function invocations
- Realtime connection count
- Storage usage
- Auth activity

---

## 📞 Support & Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)

---

## 🎉 Quick Start Commands

```bash
# 1. Clone and navigate
cd supabase

# 2. Run SQL migrations in Supabase Dashboard SQL Editor
# Execute in order: 01_schema.sql → 02_triggers.sql → 03_rls_policies.sql → 04_seed_data.sql

# 3. Deploy Edge Functions
supabase functions deploy get-notifications
supabase functions deploy mark-notification-read
supabase functions deploy get-stock-alerts
supabase functions deploy update-stock
supabase functions deploy create-purchase-request

# 4. Enable Realtime for tables
# Do this in Supabase Dashboard → Database → Replication

# 5. Update your .env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# 6. Start developing!
npm run dev
```

---

**Built with ❤️ using Supabase, PostgreSQL, and TypeScript**
