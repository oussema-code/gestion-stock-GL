-- ============================================================================
-- DATABASE TRIGGERS AND FUNCTIONS
-- Automated business logic and data integrity
-- ============================================================================

-- ============================================================================
-- FUNCTION: Update timestamp on record modification
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON public.purchase_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON public.sales_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FUNCTION: Update product stock after movement
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_product_record RECORD;
BEGIN
    -- Get current product info
    SELECT * INTO v_product_record
    FROM public.products
    WHERE id = NEW.product_id;

    -- Calculate new stock based on movement type
    IF NEW.movement_type = 'in' THEN
        UPDATE public.products
        SET current_stock = current_stock + NEW.quantity,
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.product_id;
    ELSIF NEW.movement_type IN ('out', 'adjustment', 'transfer') THEN
        UPDATE public.products
        SET current_stock = GREATEST(0, current_stock - NEW.quantity),
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.product_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_stock
    AFTER INSERT ON public.stock_movements
    FOR EACH ROW EXECUTE FUNCTION public.update_product_stock();

-- ============================================================================
-- FUNCTION: Check for low stock and create alert
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_low_stock_alert()
RETURNS TRIGGER AS $$
DECLARE
    v_product RECORD;
    v_alert_message TEXT;
    v_priority alert_priority;
    v_suggested_quantity NUMERIC;
BEGIN
    -- Get updated product information
    SELECT * INTO v_product
    FROM public.products
    WHERE id = NEW.product_id;

    -- Only proceed if stock is below minimum
    IF v_product.current_stock < v_product.min_stock THEN
        
        -- Determine priority based on how low the stock is
        IF v_product.current_stock <= v_product.min_stock * 0.3 THEN
            v_priority := 'critical';
        ELSIF v_product.current_stock <= v_product.min_stock * 0.5 THEN
            v_priority := 'high';
        ELSIF v_product.current_stock <= v_product.min_stock * 0.8 THEN
            v_priority := 'medium';
        ELSE
            v_priority := 'low';
        END IF;

        -- Calculate suggested order quantity (bring to max stock)
        v_suggested_quantity := v_product.max_stock - v_product.current_stock;

        -- Create alert message
        v_alert_message := format(
            'Stock Alert: %s (%s) is below minimum threshold. Current: %s %s, Minimum: %s %s',
            v_product.name,
            v_product.sku,
            v_product.current_stock,
            v_product.unit,
            v_product.min_stock,
            v_product.unit
        );

        -- Insert alert only if one doesn't exist for this product already (unresolved)
        INSERT INTO public.stock_alerts (
            product_id,
            alert_type,
            priority,
            message,
            current_stock,
            min_stock,
            suggested_order_quantity
        )
        SELECT 
            v_product.id,
            'low_stock',
            v_priority,
            v_alert_message,
            v_product.current_stock,
            v_product.min_stock,
            v_suggested_quantity
        WHERE NOT EXISTS (
            SELECT 1 FROM public.stock_alerts
            WHERE product_id = v_product.id
            AND is_resolved = false
            AND alert_type = 'low_stock'
        );

        -- Create notifications for admin and manager users
        INSERT INTO public.notifications (user_id, title, message, notification_type, priority, reference_id, reference_type)
        SELECT 
            up.id,
            'Low Stock Alert',
            v_alert_message,
            'stock_alert',
            v_priority,
            v_product.id,
            'product'
        FROM public.user_profiles up
        WHERE up.role IN ('admin', 'manager') AND up.is_active = true;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_low_stock
    AFTER INSERT ON public.stock_movements
    FOR EACH ROW EXECUTE FUNCTION public.check_low_stock_alert();

-- ============================================================================
-- FUNCTION: Auto-generate order numbers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_purchase_request_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.request_number IS NULL THEN
        NEW.request_number := 'PR-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                             LPAD(nextval('purchase_request_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gen_purchase_request_number
    BEFORE INSERT ON public.purchase_requests
    FOR EACH ROW EXECUTE FUNCTION public.generate_purchase_request_number();

CREATE OR REPLACE FUNCTION public.generate_purchase_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'PO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                           LPAD(nextval('purchase_order_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gen_purchase_order_number
    BEFORE INSERT ON public.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION public.generate_purchase_order_number();

CREATE OR REPLACE FUNCTION public.generate_sales_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'SO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                           LPAD(nextval('sales_order_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gen_sales_order_number
    BEFORE INSERT ON public.sales_orders
    FOR EACH ROW EXECUTE FUNCTION public.generate_sales_order_number();

CREATE OR REPLACE FUNCTION public.generate_customer_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_code IS NULL THEN
        NEW.customer_code := 'CUST-' || LPAD(nextval('customer_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gen_customer_code
    BEFORE INSERT ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.generate_customer_code();

-- ============================================================================
-- FUNCTION: Update purchase order total
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_purchase_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.purchase_orders
    SET 
        total_amount = (
            SELECT COALESCE(SUM(line_total), 0)
            FROM public.purchase_order_items
            WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id)
        ),
        updated_at = timezone('utc'::text, now())
    WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_po_total
    AFTER INSERT OR UPDATE OR DELETE ON public.purchase_order_items
    FOR EACH ROW EXECUTE FUNCTION public.update_purchase_order_total();

-- ============================================================================
-- FUNCTION: Update sales order total
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_sales_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.sales_orders
    SET 
        total_amount = (
            SELECT COALESCE(SUM(line_total), 0)
            FROM public.sales_order_items
            WHERE sales_order_id = COALESCE(NEW.sales_order_id, OLD.sales_order_id)
        ),
        updated_at = timezone('utc'::text, now())
    WHERE id = COALESCE(NEW.sales_order_id, OLD.sales_order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_so_total
    AFTER INSERT OR UPDATE OR DELETE ON public.sales_order_items
    FOR EACH ROW EXECUTE FUNCTION public.update_sales_order_total();

-- ============================================================================
-- FUNCTION: Process stock movement from stock_movements table
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_stock_movement_details()
RETURNS TRIGGER AS $$
DECLARE
    v_current_stock NUMERIC;
BEGIN
    -- Get current stock before movement
    SELECT current_stock INTO v_current_stock
    FROM public.products
    WHERE id = NEW.product_id;

    NEW.previous_stock := v_current_stock;

    -- Calculate new stock
    IF NEW.movement_type = 'in' THEN
        NEW.new_stock := v_current_stock + NEW.quantity;
    ELSE
        NEW.new_stock := GREATEST(0, v_current_stock - NEW.quantity);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_stock_movement_details
    BEFORE INSERT ON public.stock_movements
    FOR EACH ROW EXECUTE FUNCTION public.set_stock_movement_details();

-- ============================================================================
-- FUNCTION: Audit log trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB;
    v_new_data JSONB;
    v_changed_fields TEXT[];
BEGIN
    IF TG_OP = 'UPDATE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        
        -- Find changed fields
        SELECT array_agg(key)
        INTO v_changed_fields
        FROM jsonb_each(v_new_data)
        WHERE v_new_data->key IS DISTINCT FROM v_old_data->key;

        INSERT INTO public.audit_logs (
            table_name,
            record_id,
            action,
            old_data,
            new_data,
            changed_fields,
            user_id
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            v_old_data,
            v_new_data,
            v_changed_fields,
            auth.uid()
        );
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            table_name,
            record_id,
            action,
            new_data,
            user_id
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            to_jsonb(NEW),
            auth.uid()
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            table_name,
            record_id,
            action,
            old_data,
            user_id
        ) VALUES (
            TG_TABLE_NAME,
            OLD.id,
            TG_OP,
            to_jsonb(OLD),
            auth.uid()
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to critical tables
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_purchase_orders AFTER INSERT OR UPDATE OR DELETE ON public.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_sales_orders AFTER INSERT OR UPDATE OR DELETE ON public.sales_orders
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- ============================================================================
-- FUNCTION: Auto-create purchase request from critical stock alert
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_create_purchase_request()
RETURNS TRIGGER AS $$
DECLARE
    v_product RECORD;
    v_admin_id UUID;
BEGIN
    -- Only auto-create for critical priority alerts
    IF NEW.priority = 'critical' AND NEW.alert_type = 'low_stock' THEN
        
        -- Get product details
        SELECT * INTO v_product
        FROM public.products
        WHERE id = NEW.product_id;

        -- Get first admin user
        SELECT id INTO v_admin_id
        FROM public.user_profiles
        WHERE role = 'admin' AND is_active = true
        LIMIT 1;

        -- Create purchase request
        INSERT INTO public.purchase_requests (
            product_id,
            quantity,
            urgency,
            reason,
            estimated_price,
            status,
            requested_by,
            stock_alert_id
        ) VALUES (
            NEW.product_id,
            NEW.suggested_order_quantity,
            'critical',
            'Auto-generated from critical stock alert',
            v_product.unit_price * NEW.suggested_order_quantity,
            'pending',
            v_admin_id,
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_purchase_request
    AFTER INSERT ON public.stock_alerts
    FOR EACH ROW EXECUTE FUNCTION public.auto_create_purchase_request();
