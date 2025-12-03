-- ============================================================================
-- SAMPLE SEED DATA
-- Test data for development and demonstration
-- ============================================================================

-- ============================================================================
-- SUPPLIERS
-- ============================================================================

INSERT INTO public.suppliers (id, name, contact_person, email, phone, address, city, country, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ABC Supplies Co.', 'John Smith', 'john@abcsupplies.com', '+1-555-0101', '123 Supply St', 'New York', 'USA', true),
('550e8400-e29b-41d4-a716-446655440002', 'XYZ Materials Ltd.', 'Jane Doe', 'jane@xyzmaterials.com', '+1-555-0102', '456 Material Ave', 'Chicago', 'USA', true),
('550e8400-e29b-41d4-a716-446655440003', 'Global Parts Inc.', 'Bob Johnson', 'bob@globalparts.com', '+1-555-0103', '789 Parts Blvd', 'Los Angeles', 'USA', true),
('550e8400-e29b-41d4-a716-446655440004', 'TechParts Manufacturing', 'Alice Williams', 'alice@techparts.com', '+1-555-0104', '321 Tech Road', 'Boston', 'USA', true),
('550e8400-e29b-41d4-a716-446655440005', 'Chemical Supplies Co.', 'Charlie Brown', 'charlie@chemicalsupplies.com', '+1-555-0105', '654 Chem Street', 'Houston', 'USA', true);

-- ============================================================================
-- PRODUCTS
-- ============================================================================

INSERT INTO public.products (id, sku, name, description, category, unit, current_stock, min_stock, max_stock, unit_price, location, supplier_id, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'RM-001', 'Raw Material X', 'High-grade raw material for production', 'raw_materials', 'kg', 45, 100, 500, 25.50, 'Warehouse A - Shelf 12', '550e8400-e29b-41d4-a716-446655440001', true),
('660e8400-e29b-41d4-a716-446655440002', 'CP-045', 'Component Y', 'Electronic component for assembly', 'components', 'pcs', 78, 150, 600, 15.75, 'Warehouse B - Shelf 05', '550e8400-e29b-41d4-a716-446655440002', true),
('660e8400-e29b-41d4-a716-446655440003', 'RM-089', 'Material Z', 'Liquid chemical material', 'raw_materials', 'L', 120, 200, 800, 42.00, 'Warehouse A - Shelf 08', '550e8400-e29b-41d4-a716-446655440003', true),
('660e8400-e29b-41d4-a716-446655440004', 'FP-201', 'Finished Product A', 'Complete assembled product', 'finished_products', 'pcs', 350, 200, 1000, 125.00, 'Warehouse C - Zone A', null, true),
('660e8400-e29b-41d4-a716-446655440005', 'PK-012', 'Packaging Material', 'Standard packaging boxes', 'packaging', 'pcs', 1200, 500, 2000, 2.50, 'Warehouse B - Shelf 15', '550e8400-e29b-41d4-a716-446655440001', true),
('660e8400-e29b-41d4-a716-446655440006', 'EC-334', 'Electronic Component E1', 'Specialized electronic part', 'components', 'pcs', 25, 100, 400, 85.00, 'Warehouse A - Shelf 03', '550e8400-e29b-41d4-a716-446655440004', true),
('660e8400-e29b-41d4-a716-446655440007', 'RM-156', 'Adhesive Material', 'Industrial adhesive', 'raw_materials', 'L', 450, 300, 1000, 18.25, 'Warehouse A - Shelf 20', '550e8400-e29b-41d4-a716-446655440005', true),
('660e8400-e29b-41d4-a716-446655440008', 'RM-203', 'Metal Sheet Type B', 'Stainless steel sheets', 'raw_materials', 'pcs', 180, 150, 500, 55.00, 'Warehouse C - Zone B', '550e8400-e29b-41d4-a716-446655440003', true);

-- ============================================================================
-- CUSTOMERS
-- ============================================================================

INSERT INTO public.customers (id, customer_code, company_name, contact_name, email, phone, address, city, country, customer_type, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'CUST-01001', 'Tech Solutions Inc.', 'Michael Chen', 'michael@techsolutions.com', '+1-555-1001', '100 Tech Plaza', 'San Francisco', 'USA', 'wholesale', true),
('770e8400-e29b-41d4-a716-446655440002', 'CUST-01002', 'Retail Mart Corp.', 'Sarah Johnson', 'sarah@retailmart.com', '+1-555-1002', '200 Retail Street', 'Seattle', 'USA', 'retail', true),
('770e8400-e29b-41d4-a716-446655440003', 'CUST-01003', 'Distribution Partners Ltd.', 'David Lee', 'david@distpartners.com', '+1-555-1003', '300 Distribution Ave', 'Miami', 'USA', 'distributor', true),
('770e8400-e29b-41d4-a716-446655440004', 'CUST-01004', 'Manufacturing Plus', 'Emma Wilson', 'emma@mfgplus.com', '+1-555-1004', '400 Factory Road', 'Detroit', 'USA', 'wholesale', true),
('770e8400-e29b-41d4-a716-446655440005', 'CUST-01005', 'Global Traders', 'James Martinez', 'james@globaltraders.com', '+1-555-1005', '500 Trade Center', 'Atlanta', 'USA', 'distributor', true);

-- ============================================================================
-- SAMPLE STOCK MOVEMENTS
-- Note: These will trigger stock updates and potentially create alerts
-- ============================================================================

-- Stock OUT movements that will trigger low stock alerts
INSERT INTO public.stock_movements (product_id, movement_type, quantity, previous_stock, new_stock, notes, created_by) 
SELECT 
    '660e8400-e29b-41d4-a716-446655440001',
    'out',
    55,
    100,
    45,
    'Production consumption',
    id
FROM public.user_profiles 
WHERE role = 'admin' 
LIMIT 1;

INSERT INTO public.stock_movements (product_id, movement_type, quantity, previous_stock, new_stock, notes, created_by) 
SELECT 
    '660e8400-e29b-41d4-a716-446655440002',
    'out',
    72,
    150,
    78,
    'Assembly line usage',
    id
FROM public.user_profiles 
WHERE role = 'admin' 
LIMIT 1;

-- ============================================================================
-- SAMPLE CUSTOMER INTERACTIONS
-- ============================================================================

INSERT INTO public.customer_interactions (customer_id, interaction_type, subject, description, created_by)
SELECT 
    '770e8400-e29b-41d4-a716-446655440001',
    'call',
    'Initial consultation',
    'Discussed product requirements and pricing',
    id
FROM public.user_profiles 
WHERE role = 'manager' 
LIMIT 1;

INSERT INTO public.customer_interactions (customer_id, interaction_type, subject, description, created_by)
SELECT 
    '770e8400-e29b-41d4-a716-446655440002',
    'email',
    'Quote request',
    'Sent detailed quote for bulk order',
    id
FROM public.user_profiles 
WHERE role = 'manager' 
LIMIT 1;

-- ============================================================================
-- SAMPLE SALES ORDERS
-- ============================================================================

INSERT INTO public.sales_orders (order_number, customer_id, status, order_date, total_amount, created_by)
SELECT 
    'SO-2024-3001',
    '770e8400-e29b-41d4-a716-446655440001',
    'confirmed',
    CURRENT_DATE - INTERVAL '5 days',
    15000.00,
    id
FROM public.user_profiles 
WHERE role = 'manager' 
LIMIT 1;

-- ============================================================================
-- Notes on Usage
-- ============================================================================

-- After running this seed data:
-- 1. Stock alerts should be automatically created for low stock items
-- 2. Notifications will be sent to admin/manager users
-- 3. You can test the purchase request workflow
-- 4. Sample data is available for all modules

-- To reset and re-seed:
-- DELETE FROM public.stock_movements;
-- DELETE FROM public.stock_alerts;
-- DELETE FROM public.notifications;
-- DELETE FROM public.products;
-- DELETE FROM public.suppliers;
-- DELETE FROM public.customers;
-- Then run this seed file again
