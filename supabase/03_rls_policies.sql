-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Security rules based on user roles
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is manager or admin
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role IN ('admin', 'manager')
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.user_profiles FOR SELECT
    USING (public.is_admin());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Only admins can insert or delete profiles
CREATE POLICY "Admins can insert profiles"
    ON public.user_profiles FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete profiles"
    ON public.user_profiles FOR DELETE
    USING (public.is_admin());

-- ============================================================================
-- PRODUCTS POLICIES
-- ============================================================================

-- Everyone can view active products
CREATE POLICY "All authenticated users can view products"
    ON public.products FOR SELECT
    USING (auth.role() = 'authenticated');

-- Managers and admins can insert products
CREATE POLICY "Managers can insert products"
    ON public.products FOR INSERT
    WITH CHECK (public.is_manager_or_admin());

-- Managers and admins can update products
CREATE POLICY "Managers can update products"
    ON public.products FOR UPDATE
    USING (public.is_manager_or_admin())
    WITH CHECK (public.is_manager_or_admin());

-- Only admins can delete products
CREATE POLICY "Admins can delete products"
    ON public.products FOR DELETE
    USING (public.is_admin());

-- ============================================================================
-- SUPPLIERS POLICIES
-- ============================================================================

-- All authenticated users can view suppliers
CREATE POLICY "All users can view suppliers"
    ON public.suppliers FOR SELECT
    USING (auth.role() = 'authenticated');

-- Managers can manage suppliers
CREATE POLICY "Managers can insert suppliers"
    ON public.suppliers FOR INSERT
    WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "Managers can update suppliers"
    ON public.suppliers FOR UPDATE
    USING (public.is_manager_or_admin());

CREATE POLICY "Admins can delete suppliers"
    ON public.suppliers FOR DELETE
    USING (public.is_admin());

-- ============================================================================
-- STOCK MOVEMENTS POLICIES
-- ============================================================================

-- All users can view stock movements
CREATE POLICY "All users can view stock movements"
    ON public.stock_movements FOR SELECT
    USING (auth.role() = 'authenticated');

-- All authenticated users can create stock movements
CREATE POLICY "All users can create stock movements"
    ON public.stock_movements FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND created_by = auth.uid()
    );

-- Only admins can delete stock movements (for corrections)
CREATE POLICY "Admins can delete stock movements"
    ON public.stock_movements FOR DELETE
    USING (public.is_admin());

-- ============================================================================
-- STOCK ALERTS POLICIES
-- ============================================================================

-- All users can view alerts
CREATE POLICY "All users can view stock alerts"
    ON public.stock_alerts FOR SELECT
    USING (auth.role() = 'authenticated');

-- System creates alerts (triggered automatically)
CREATE POLICY "System can insert alerts"
    ON public.stock_alerts FOR INSERT
    WITH CHECK (true);

-- Users can update alerts they've seen
CREATE POLICY "Users can mark alerts as seen"
    ON public.stock_alerts FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (
        (is_seen = true AND seen_by = auth.uid()) OR
        public.is_manager_or_admin()
    );

-- Managers can resolve alerts
CREATE POLICY "Managers can resolve alerts"
    ON public.stock_alerts FOR UPDATE
    USING (public.is_manager_or_admin());

-- ============================================================================
-- PURCHASE REQUESTS POLICIES
-- ============================================================================

-- Users can view their own requests, managers see all
CREATE POLICY "Users view own purchase requests"
    ON public.purchase_requests FOR SELECT
    USING (
        requested_by = auth.uid() OR
        public.is_manager_or_admin()
    );

-- All users can create purchase requests
CREATE POLICY "Users can create purchase requests"
    ON public.purchase_requests FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        requested_by = auth.uid()
    );

-- Users can update their own draft requests
CREATE POLICY "Users update own draft requests"
    ON public.purchase_requests FOR UPDATE
    USING (
        (requested_by = auth.uid() AND status = 'draft') OR
        public.is_manager_or_admin()
    );

-- Managers can approve/reject
CREATE POLICY "Managers can approve requests"
    ON public.purchase_requests FOR UPDATE
    USING (public.is_manager_or_admin());

-- ============================================================================
-- PURCHASE ORDERS POLICIES
-- ============================================================================

-- All users can view purchase orders
CREATE POLICY "All users view purchase orders"
    ON public.purchase_orders FOR SELECT
    USING (auth.role() = 'authenticated');

-- Managers can create purchase orders
CREATE POLICY "Managers create purchase orders"
    ON public.purchase_orders FOR INSERT
    WITH CHECK (
        public.is_manager_or_admin() AND
        created_by = auth.uid()
    );

-- Managers can update purchase orders
CREATE POLICY "Managers update purchase orders"
    ON public.purchase_orders FOR UPDATE
    USING (public.is_manager_or_admin());

-- Only admins can delete purchase orders
CREATE POLICY "Admins delete purchase orders"
    ON public.purchase_orders FOR DELETE
    USING (public.is_admin());

-- ============================================================================
-- PURCHASE ORDER ITEMS POLICIES
-- ============================================================================

-- Users can view PO items if they can view the PO
CREATE POLICY "Users view po items"
    ON public.purchase_order_items FOR SELECT
    USING (auth.role() = 'authenticated');

-- Managers can manage PO items
CREATE POLICY "Managers manage po items"
    ON public.purchase_order_items FOR ALL
    USING (public.is_manager_or_admin())
    WITH CHECK (public.is_manager_or_admin());

-- ============================================================================
-- CUSTOMERS POLICIES
-- ============================================================================

-- All users can view customers
CREATE POLICY "All users view customers"
    ON public.customers FOR SELECT
    USING (auth.role() = 'authenticated');

-- Managers can manage customers
CREATE POLICY "Managers manage customers"
    ON public.customers FOR INSERT
    WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "Managers update customers"
    ON public.customers FOR UPDATE
    USING (public.is_manager_or_admin());

CREATE POLICY "Admins delete customers"
    ON public.customers FOR DELETE
    USING (public.is_admin());

-- ============================================================================
-- CUSTOMER INTERACTIONS POLICIES
-- ============================================================================

-- Users can view interactions they created
CREATE POLICY "Users view own interactions"
    ON public.customer_interactions FOR SELECT
    USING (
        created_by = auth.uid() OR
        public.is_manager_or_admin()
    );

-- All users can create interactions
CREATE POLICY "Users create interactions"
    ON public.customer_interactions FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        created_by = auth.uid()
    );

-- Users can update their own interactions
CREATE POLICY "Users update own interactions"
    ON public.customer_interactions FOR UPDATE
    USING (
        created_by = auth.uid() OR
        public.is_manager_or_admin()
    );

-- ============================================================================
-- SALES ORDERS POLICIES
-- ============================================================================

-- All users can view sales orders
CREATE POLICY "All users view sales orders"
    ON public.sales_orders FOR SELECT
    USING (auth.role() = 'authenticated');

-- All users can create sales orders
CREATE POLICY "Users create sales orders"
    ON public.sales_orders FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        created_by = auth.uid()
    );

-- Users can update orders they created (if draft), managers can update all
CREATE POLICY "Users update sales orders"
    ON public.sales_orders FOR UPDATE
    USING (
        (created_by = auth.uid() AND status = 'draft') OR
        public.is_manager_or_admin()
    );

-- Only admins can delete sales orders
CREATE POLICY "Admins delete sales orders"
    ON public.sales_orders FOR DELETE
    USING (public.is_admin());

-- ============================================================================
-- SALES ORDER ITEMS POLICIES
-- ============================================================================

-- Users can view SO items
CREATE POLICY "Users view so items"
    ON public.sales_order_items FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can manage items for orders they own, managers can manage all
CREATE POLICY "Users manage own so items"
    ON public.sales_order_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.sales_orders
            WHERE id = sales_order_id
            AND (created_by = auth.uid() OR public.is_manager_or_admin())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sales_orders
            WHERE id = sales_order_id
            AND (created_by = auth.uid() OR public.is_manager_or_admin())
        )
    );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can only see their own notifications
CREATE POLICY "Users view own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

-- System can create notifications
CREATE POLICY "System creates notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users update own notifications"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users delete own notifications"
    ON public.notifications FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Only admins can view audit logs
CREATE POLICY "Admins view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin());

-- System can insert audit logs
CREATE POLICY "System creates audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- No one can update or delete audit logs (immutable)
-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE purchase_request_seq TO authenticated;
GRANT USAGE ON SEQUENCE purchase_order_seq TO authenticated;
GRANT USAGE ON SEQUENCE sales_order_seq TO authenticated;
GRANT USAGE ON SEQUENCE customer_seq TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager_or_admin() TO authenticated;
