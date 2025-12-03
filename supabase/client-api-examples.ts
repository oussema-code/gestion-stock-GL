// ============================================================================
// Supabase TypeScript Client - API Examples
// Frontend integration examples for the ERP system
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, fullName: string, role: 'admin' | 'manager' | 'employee' = 'employee') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })

  return { data, error }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

/**
 * Sign in with magic link
 */
export async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  return { data, error }
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: null, error: new Error('Not authenticated') }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { data, error }
}

// ============================================================================
// STOCK MANAGEMENT
// ============================================================================

/**
 * Get all products with optional filters
 */
export async function getProducts(filters?: {
  category?: string
  search?: string
  lowStockOnly?: boolean
}) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
  }

  if (filters?.lowStockOnly) {
    query = query.lt('current_stock', supabase.rpc('min_stock'))
  }

  const { data, error } = await query

  return { data, error }
}

/**
 * Get single product by ID
 */
export async function getProductById(productId: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      supplier:suppliers (
        id,
        name,
        contact_person,
        email,
        phone
      )
    `)
    .eq('id', productId)
    .single()

  return { data, error }
}

/**
 * Create a new product
 */
export async function createProduct(productData: {
  sku: string
  name: string
  description?: string
  category: string
  unit: string
  min_stock: number
  max_stock: number
  unit_price: number
  location?: string
  supplier_id?: string
}) {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()

  return { data, error }
}

/**
 * Update product
 */
export async function updateProduct(productId: string, updates: Partial<any>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single()

  return { data, error }
}

/**
 * Get stock alerts
 */
export async function getStockAlerts(unresolvedOnly = true) {
  const { data, error } = await supabase.functions.invoke('get-stock-alerts', {
    body: { unresolved_only: unresolvedOnly },
  })

  return { data: data?.data, error }
}

/**
 * Update stock (create stock movement)
 */
export async function updateStock(stockData: {
  product_id: string
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer'
  quantity: number
  reference_id?: string
  reference_type?: string
  notes?: string
}) {
  const { data, error } = await supabase.functions.invoke('update-stock', {
    body: stockData,
  })

  return { data: data?.data, error }
}

/**
 * Get stock movements for a product
 */
export async function getStockMovements(productId?: string, limit = 50) {
  let query = supabase
    .from('stock_movements')
    .select(`
      *,
      product:products (
        id,
        sku,
        name,
        unit
      ),
      created_by_user:user_profiles!stock_movements_created_by_fkey (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (productId) {
    query = query.eq('product_id', productId)
  }

  const { data, error } = await query

  return { data, error }
}

/**
 * Mark stock alert as resolved
 */
export async function resolveStockAlert(alertId: string, resolutionNotes?: string) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('stock_alerts')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id,
      resolution_notes: resolutionNotes,
    })
    .eq('id', alertId)
    .select()
    .single()

  return { data, error }
}

// ============================================================================
// PURCHASE MANAGEMENT
// ============================================================================

/**
 * Create a purchase request
 */
export async function createPurchaseRequest(requestData: {
  product_id: string
  quantity: number
  urgency?: 'low' | 'medium' | 'high' | 'critical'
  reason?: string
  stock_alert_id?: string
}) {
  const { data, error } = await supabase.functions.invoke('create-purchase-request', {
    body: requestData,
  })

  return { data: data?.data, error }
}

/**
 * Get purchase requests
 */
export async function getPurchaseRequests(status?: string) {
  let query = supabase
    .from('purchase_requests')
    .select(`
      *,
      product:products (
        id,
        sku,
        name,
        unit,
        unit_price
      ),
      requester:user_profiles!purchase_requests_requested_by_fkey (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  return { data, error }
}

/**
 * Approve purchase request
 */
export async function approvePurchaseRequest(requestId: string) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('purchase_requests')
    .update({
      status: 'approved',
      approved_by: user?.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single()

  return { data, error }
}

/**
 * Create purchase order
 */
export async function createPurchaseOrder(orderData: {
  supplier_id: string
  items: Array<{
    product_id: string
    quantity: number
    unit_price: number
  }>
  expected_delivery_date?: string
  notes?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()

  // Create purchase order
  const { data: order, error: orderError } = await supabase
    .from('purchase_orders')
    .insert({
      supplier_id: orderData.supplier_id,
      status: 'pending',
      expected_delivery_date: orderData.expected_delivery_date,
      notes: orderData.notes,
      created_by: user?.id,
    })
    .select()
    .single()

  if (orderError || !order) {
    return { data: null, error: orderError }
  }

  // Create order items
  const items = orderData.items.map(item => ({
    ...item,
    purchase_order_id: order.id,
  }))

  const { data: orderItems, error: itemsError } = await supabase
    .from('purchase_order_items')
    .insert(items)
    .select()

  if (itemsError) {
    return { data: null, error: itemsError }
  }

  return { data: { order, items: orderItems }, error: null }
}

/**
 * Get purchase orders
 */
export async function getPurchaseOrders(status?: string) {
  let query = supabase
    .from('purchase_orders')
    .select(`
      *,
      supplier:suppliers (
        id,
        name,
        contact_person,
        email
      ),
      items:purchase_order_items (
        *,
        product:products (
          id,
          sku,
          name,
          unit
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  return { data, error }
}

// ============================================================================
// CRM - CUSTOMER MANAGEMENT
// ============================================================================

/**
 * Get all customers
 */
export async function getCustomers(activeOnly = true) {
  let query = supabase
    .from('customers')
    .select('*')
    .order('company_name')

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  return { data, error }
}

/**
 * Create a new customer
 */
export async function createCustomer(customerData: {
  company_name?: string
  contact_name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
}) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customerData)
    .select()
    .single()

  return { data, error }
}

/**
 * Get customer interactions
 */
export async function getCustomerInteractions(customerId: string) {
  const { data, error } = await supabase
    .from('customer_interactions')
    .select(`
      *,
      created_by_user:user_profiles!customer_interactions_created_by_fkey (
        full_name,
        email
      )
    `)
    .eq('customer_id', customerId)
    .order('interaction_date', { ascending: false })

  return { data, error }
}

/**
 * Create customer interaction
 */
export async function createInteraction(interactionData: {
  customer_id: string
  interaction_type: string
  subject: string
  description?: string
  next_followup_date?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('customer_interactions')
    .insert({
      ...interactionData,
      created_by: user?.id,
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Create sales order
 */
export async function createSalesOrder(orderData: {
  customer_id: string
  items: Array<{
    product_id: string
    quantity: number
    unit_price: number
  }>
  required_date?: string
  shipping_address?: string
  notes?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()

  // Create sales order
  const { data: order, error: orderError } = await supabase
    .from('sales_orders')
    .insert({
      customer_id: orderData.customer_id,
      status: 'draft',
      required_date: orderData.required_date,
      shipping_address: orderData.shipping_address,
      notes: orderData.notes,
      created_by: user?.id,
    })
    .select()
    .single()

  if (orderError || !order) {
    return { data: null, error: orderError }
  }

  // Create order items
  const items = orderData.items.map(item => ({
    ...item,
    sales_order_id: order.id,
  }))

  const { data: orderItems, error: itemsError } = await supabase
    .from('sales_order_items')
    .insert(items)
    .select()

  if (itemsError) {
    return { data: null, error: itemsError }
  }

  // Deduct stock for each item
  for (const item of orderData.items) {
    await updateStock({
      product_id: item.product_id,
      movement_type: 'out',
      quantity: item.quantity,
      reference_id: order.id,
      reference_type: 'sales_order',
      notes: `Sales order ${order.order_number}`,
    })
  }

  return { data: { order, items: orderItems }, error: null }
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Get user notifications
 */
export async function getUserNotifications(unreadOnly = false) {
  const { data, error } = await supabase.functions.invoke('get-notifications', {
    body: { unread_only: unreadOnly },
  })

  return { data: data?.data, error }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase.functions.invoke('mark-notification-read', {
    body: { notification_id: notificationId },
  })

  return { data: data?.data, error }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  const { data, error } = await supabase.functions.invoke('mark-notification-read', {
    body: { mark_all: true },
  })

  return { data: data?.data, error }
}

// ============================================================================
// REALTIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to stock alerts
 */
export function subscribeToStockAlerts(callback: (payload: any) => void) {
  return supabase
    .channel('stock-alerts')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'stock_alerts',
      },
      callback
    )
    .subscribe()
}

/**
 * Subscribe to notifications for current user
 */
export async function subscribeToNotifications(callback: (payload: any) => void) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  return supabase
    .channel('user-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      },
      callback
    )
    .subscribe()
}

/**
 * Subscribe to purchase order updates
 */
export function subscribeToPurchaseOrders(callback: (payload: any) => void) {
  return supabase
    .channel('purchase-orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'purchase_orders',
      },
      callback
    )
    .subscribe()
}
