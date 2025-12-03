-- ============================================================================
-- ERP SYSTEM DATABASE SCHEMA
-- Supabase PostgreSQL Schema with RLS and Triggers
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
CREATE TYPE stock_movement_type AS ENUM ('in', 'out', 'adjustment', 'transfer');
CREATE TYPE product_category AS ENUM ('raw_materials', 'components', 'finished_products', 'packaging');
CREATE TYPE purchase_status AS ENUM ('draft', 'pending', 'approved', 'ordered', 'received', 'cancelled');
CREATE TYPE alert_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE order_status AS ENUM ('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

-- ============================================================================
-- USER PROFILES TABLE
-- Extends Supabase Auth with additional user information
-- ============================================================================

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    department TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster role-based queries
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);

-- ============================================================================
-- PRODUCTS TABLE
-- Main product catalog
-- ============================================================================

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category product_category NOT NULL,
    unit TEXT NOT NULL, -- kg, L, pcs, etc.
    current_stock NUMERIC(12, 2) DEFAULT 0 CHECK (current_stock >= 0),
    min_stock NUMERIC(12, 2) NOT NULL CHECK (min_stock >= 0),
    max_stock NUMERIC(12, 2) NOT NULL CHECK (max_stock >= min_stock),
    reorder_point NUMERIC(12, 2),
    unit_price NUMERIC(12, 2) DEFAULT 0 CHECK (unit_price >= 0),
    location TEXT, -- Warehouse location
    supplier_id UUID REFERENCES public.suppliers(id),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_current_stock ON public.products(current_stock);
CREATE INDEX idx_products_supplier ON public.products(supplier_id);

-- ============================================================================
-- SUPPLIERS TABLE
-- Supplier management
-- ============================================================================

CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    tax_id TEXT,
    payment_terms TEXT,
    is_active BOOLEAN DEFAULT true,
    rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_suppliers_name ON public.suppliers(name);
CREATE INDEX idx_suppliers_active ON public.suppliers(is_active);

-- ============================================================================
-- STOCK MOVEMENTS TABLE
-- Track all stock in/out transactions
-- ============================================================================

CREATE TABLE public.stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    movement_type stock_movement_type NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    previous_stock NUMERIC(12, 2) NOT NULL,
    new_stock NUMERIC(12, 2) NOT NULL,
    reference_id UUID, -- Link to purchase_order, sales_order, etc.
    reference_type TEXT, -- 'purchase', 'sale', 'adjustment', etc.
    notes TEXT,
    location TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for stock movement queries
CREATE INDEX idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON public.stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON public.stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_reference ON public.stock_movements(reference_id, reference_type);

-- ============================================================================
-- STOCK ALERTS TABLE
-- Automated alerts when stock falls below threshold
-- ============================================================================

CREATE TABLE public.stock_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL DEFAULT 'low_stock',
    priority alert_priority NOT NULL DEFAULT 'medium',
    message TEXT NOT NULL,
    current_stock NUMERIC(12, 2) NOT NULL,
    min_stock NUMERIC(12, 2) NOT NULL,
    suggested_order_quantity NUMERIC(12, 2),
    is_seen BOOLEAN DEFAULT false,
    seen_at TIMESTAMP WITH TIME ZONE,
    seen_by UUID REFERENCES auth.users(id),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for alert queries
CREATE INDEX idx_stock_alerts_product ON public.stock_alerts(product_id);
CREATE INDEX idx_stock_alerts_seen ON public.stock_alerts(is_seen, created_at DESC);
CREATE INDEX idx_stock_alerts_resolved ON public.stock_alerts(is_resolved);
CREATE INDEX idx_stock_alerts_priority ON public.stock_alerts(priority, created_at DESC);

-- ============================================================================
-- PURCHASE REQUESTS TABLE
-- Internal requests for purchasing
-- ============================================================================

CREATE TABLE public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number TEXT NOT NULL UNIQUE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    urgency alert_priority DEFAULT 'medium',
    reason TEXT,
    estimated_price NUMERIC(12, 2),
    status purchase_status DEFAULT 'draft',
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    stock_alert_id UUID REFERENCES public.stock_alerts(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_purchase_requests_status ON public.purchase_requests(status);
CREATE INDEX idx_purchase_requests_product ON public.purchase_requests(product_id);
CREATE INDEX idx_purchase_requests_requested_by ON public.purchase_requests(requested_by);

-- ============================================================================
-- PURCHASE ORDERS TABLE
-- Formal orders sent to suppliers
-- ============================================================================

CREATE TABLE public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    status purchase_status DEFAULT 'pending',
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    total_amount NUMERIC(12, 2) DEFAULT 0,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    shipping_cost NUMERIC(12, 2) DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    notes TEXT,
    terms_conditions TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_purchase_orders_date ON public.purchase_orders(order_date DESC);

-- ============================================================================
-- PURCHASE ORDER ITEMS TABLE
-- Line items for purchase orders
-- ============================================================================

CREATE TABLE public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    purchase_request_id UUID REFERENCES public.purchase_requests(id),
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    discount_rate NUMERIC(5, 2) DEFAULT 0,
    line_total NUMERIC(12, 2) GENERATED ALWAYS AS (
        quantity * unit_price * (1 - discount_rate / 100) * (1 + tax_rate / 100)
    ) STORED,
    received_quantity NUMERIC(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_po_items_order ON public.purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_product ON public.purchase_order_items(product_id);

-- ============================================================================
-- CUSTOMERS TABLE
-- CRM - Customer management
-- ============================================================================

CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code TEXT NOT NULL UNIQUE,
    company_name TEXT,
    contact_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    tax_id TEXT,
    payment_terms TEXT DEFAULT 'Net 30',
    credit_limit NUMERIC(12, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    customer_type TEXT, -- 'retail', 'wholesale', 'distributor'
    rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_customers_code ON public.customers(customer_code);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_active ON public.customers(is_active);

-- ============================================================================
-- CUSTOMER INTERACTIONS TABLE
-- CRM - Track customer communications
-- ============================================================================

CREATE TABLE public.customer_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- 'call', 'email', 'meeting', 'note'
    subject TEXT NOT NULL,
    description TEXT,
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    next_followup_date DATE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_interactions_customer ON public.customer_interactions(customer_id);
CREATE INDEX idx_interactions_date ON public.customer_interactions(interaction_date DESC);
CREATE INDEX idx_interactions_type ON public.customer_interactions(interaction_type);

-- ============================================================================
-- SALES ORDERS TABLE
-- CRM - Customer orders
-- ============================================================================

CREATE TABLE public.sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    status order_status DEFAULT 'draft',
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    required_date DATE,
    shipped_date DATE,
    total_amount NUMERIC(12, 2) DEFAULT 0,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    shipping_cost NUMERIC(12, 2) DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'partial', 'paid'
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_sales_orders_customer ON public.sales_orders(customer_id);
CREATE INDEX idx_sales_orders_status ON public.sales_orders(status);
CREATE INDEX idx_sales_orders_date ON public.sales_orders(order_date DESC);

-- ============================================================================
-- SALES ORDER ITEMS TABLE
-- Line items for sales orders
-- ============================================================================

CREATE TABLE public.sales_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    discount_rate NUMERIC(5, 2) DEFAULT 0,
    line_total NUMERIC(12, 2) GENERATED ALWAYS AS (
        quantity * unit_price * (1 - discount_rate / 100) * (1 + tax_rate / 100)
    ) STORED,
    shipped_quantity NUMERIC(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_so_items_order ON public.sales_order_items(sales_order_id);
CREATE INDEX idx_so_items_product ON public.sales_order_items(product_id);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- System-wide notification center
-- ============================================================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL, -- 'stock_alert', 'purchase', 'sale', 'system'
    priority alert_priority DEFAULT 'medium',
    reference_id UUID, -- Link to related entity
    reference_type TEXT, -- 'product', 'order', 'customer', etc.
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX idx_notifications_priority ON public.notifications(priority);

-- ============================================================================
-- AUDIT LOG TABLE
-- Track all important system actions
-- ============================================================================

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES auth.users(id),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_audit_logs_table ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_date ON public.audit_logs(created_at DESC);

-- ============================================================================
-- SEQUENCES FOR ORDER NUMBERS
-- ============================================================================

CREATE SEQUENCE purchase_request_seq START 1000;
CREATE SEQUENCE purchase_order_seq START 2000;
CREATE SEQUENCE sales_order_seq START 3000;
CREATE SEQUENCE customer_seq START 1000;
