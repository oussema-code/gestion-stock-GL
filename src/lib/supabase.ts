import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Auth helpers
export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signUp: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Products API
export const productsAPI = {
  getAll: async (filters?: { lowStockOnly?: boolean; category?: string }) => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;
    
    // Filter low stock items client-side if needed
    if (data && filters?.lowStockOnly) {
      const filteredData = data.filter(product => product.current_stock < product.min_stock);
      return { data: filteredData, error };
    }

    return { data, error };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  create: async (product: any) => {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    return { data, error };
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },
};

// Stock API
export const stockAPI = {
  getMovements: async (productId?: string, limit = 50) => {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        product:products(name, sku),
        created_by_user:user_profiles(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  updateStock: async (movement: {
    product_id: string;
    movement_type: 'in' | 'out';
    quantity: number;
    reference_type?: string;
    reference_id?: string;
    notes?: string;
  }) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // Add created_by to the movement
    const movementWithUser = {
      ...movement,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from('stock_movements')
      .insert([movementWithUser])
      .select()
      .single();
    return { data, error };
  },

  getAlerts: async (unresolvedOnly = false) => {
    let query = supabase
      .from('stock_alerts')
      .select(`
        *,
        product:products(*)
      `)
      .order('created_at', { ascending: false });

    if (unresolvedOnly) {
      query = query.is('resolved_at', null);
    }

    const { data, error } = await query;
    return { data, error };
  },

  resolveAlert: async (alertId: string) => {
    const { data, error } = await supabase
      .from('stock_alerts')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', alertId)
      .select()
      .single();
    return { data, error };
  },
};

// Purchase API
export const purchaseAPI = {
  getRequests: async (status?: string) => {
    let query = supabase
      .from('purchase_requests')
      .select(`
        *,
        product:products(name, sku),
        requested_by_user:user_profiles!purchase_requests_requested_by_fkey(full_name),
        approved_by_user:user_profiles!purchase_requests_approved_by_fkey(full_name)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data, error };
  },

  createRequest: async (request: {
    product_id: string;
    quantity: number;
    urgency: 'low' | 'medium' | 'high';
    notes?: string;
  }) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // Add requested_by to the request
    const requestWithUser = {
      ...request,
      requested_by: user.id,
    };

    const { data, error } = await supabase
      .from('purchase_requests')
      .insert([requestWithUser])
      .select()
      .single();
    return { data, error };
  },

  approveRequest: async (requestId: string) => {
    const { data, error } = await supabase
      .from('purchase_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();
    return { data, error };
  },

  getOrders: async (status?: string) => {
    let query = supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:purchase_order_items(
          *,
          product:products(name, sku)
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data, error };
  },

  createOrder: async (order: any) => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([order])
      .select()
      .single();
    return { data, error };
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (unreadOnly = false) => {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.is('read_at', null);
    }

    const { data, error } = await query;
    return { data, error };
  },

  markAsRead: async (notificationId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single();
    return { data, error };
  },

  markAllAsRead: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);

    return { error };
  },
};

// Realtime subscriptions
export const realtime = {
  subscribeToStockAlerts: (callback: (payload: any) => void) => {
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
      .subscribe();
  },

  subscribeToNotifications: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToPurchaseOrders: (callback: (payload: any) => void) => {
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
      .subscribe();
  },
};

// Customer API
export const customerAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data, error };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        sales_orders(count)
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  create: async (customer: any) => {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    return { data, error };
  },
};

// Sales API
export const salesAPI = {
  getOrders: async (customerId?: string) => {
    let query = supabase
      .from('sales_orders')
      .select(`
        *,
        customer:customers(name, email),
        items:sales_order_items(
          *,
          product:products(name, sku)
        )
      `)
      .order('created_at', { ascending: false });

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  createOrder: async (order: any) => {
    const { data, error } = await supabase
      .from('sales_orders')
      .insert([order])
      .select()
      .single();
    return { data, error };
  },
};

export default supabase;
