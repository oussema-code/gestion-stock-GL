// ============================================================================
// Supabase Database Types
// Auto-generated types for TypeScript safety
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'manager' | 'employee'
export type StockMovementType = 'in' | 'out' | 'adjustment' | 'transfer'
export type ProductCategory = 'raw_materials' | 'components' | 'finished_products' | 'packaging'
export type PurchaseStatus = 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled'
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical'
export type OrderStatus = 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          department: string | null
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: UserRole
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: UserRole
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          sku: string
          name: string
          description: string | null
          category: ProductCategory
          unit: string
          current_stock: number
          min_stock: number
          max_stock: number
          reorder_point: number | null
          unit_price: number
          location: string | null
          supplier_id: string | null
          is_active: boolean
          metadata: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          name: string
          description?: string | null
          category: ProductCategory
          unit: string
          current_stock?: number
          min_stock: number
          max_stock: number
          reorder_point?: number | null
          unit_price?: number
          location?: string | null
          supplier_id?: string | null
          is_active?: boolean
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          description?: string | null
          category?: ProductCategory
          unit?: string
          current_stock?: number
          min_stock?: number
          max_stock?: number
          reorder_point?: number | null
          unit_price?: number
          location?: string | null
          supplier_id?: string | null
          is_active?: boolean
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          country: string | null
          tax_id: string | null
          payment_terms: string | null
          is_active: boolean
          rating: number | null
          metadata: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          tax_id?: string | null
          payment_terms?: string | null
          is_active?: boolean
          rating?: number | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          tax_id?: string | null
          payment_terms?: string | null
          is_active?: boolean
          rating?: number | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          movement_type: StockMovementType
          quantity: number
          previous_stock: number
          new_stock: number
          reference_id: string | null
          reference_type: string | null
          notes: string | null
          location: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          movement_type: StockMovementType
          quantity: number
          previous_stock: number
          new_stock: number
          reference_id?: string | null
          reference_type?: string | null
          notes?: string | null
          location?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          movement_type?: StockMovementType
          quantity?: number
          previous_stock?: number
          new_stock?: number
          reference_id?: string | null
          reference_type?: string | null
          notes?: string | null
          location?: string | null
          created_by?: string
          created_at?: string
        }
      }
      stock_alerts: {
        Row: {
          id: string
          product_id: string
          alert_type: string
          priority: AlertPriority
          message: string
          current_stock: number
          min_stock: number
          suggested_order_quantity: number | null
          is_seen: boolean
          seen_at: string | null
          seen_by: string | null
          is_resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          resolution_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          alert_type?: string
          priority?: AlertPriority
          message: string
          current_stock: number
          min_stock: number
          suggested_order_quantity?: number | null
          is_seen?: boolean
          seen_at?: string | null
          seen_by?: string | null
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          alert_type?: string
          priority?: AlertPriority
          message?: string
          current_stock?: number
          min_stock?: number
          suggested_order_quantity?: number | null
          is_seen?: boolean
          seen_at?: string | null
          seen_by?: string | null
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          created_at?: string
        }
      }
      purchase_requests: {
        Row: {
          id: string
          request_number: string
          product_id: string
          quantity: number
          urgency: AlertPriority
          reason: string | null
          estimated_price: number | null
          status: PurchaseStatus
          requested_by: string
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          stock_alert_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_number?: string
          product_id: string
          quantity: number
          urgency?: AlertPriority
          reason?: string | null
          estimated_price?: number | null
          status?: PurchaseStatus
          requested_by: string
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          stock_alert_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_number?: string
          product_id?: string
          quantity?: number
          urgency?: AlertPriority
          reason?: string | null
          estimated_price?: number | null
          status?: PurchaseStatus
          requested_by?: string
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          stock_alert_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      purchase_orders: {
        Row: {
          id: string
          order_number: string
          supplier_id: string
          status: PurchaseStatus
          order_date: string
          expected_delivery_date: string | null
          actual_delivery_date: string | null
          total_amount: number
          tax_amount: number
          shipping_cost: number
          discount_amount: number
          notes: string | null
          terms_conditions: string | null
          created_by: string
          approved_by: string | null
          approved_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          supplier_id: string
          status?: PurchaseStatus
          order_date?: string
          expected_delivery_date?: string | null
          actual_delivery_date?: string | null
          total_amount?: number
          tax_amount?: number
          shipping_cost?: number
          discount_amount?: number
          notes?: string | null
          terms_conditions?: string | null
          created_by: string
          approved_by?: string | null
          approved_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          supplier_id?: string
          status?: PurchaseStatus
          order_date?: string
          expected_delivery_date?: string | null
          actual_delivery_date?: string | null
          total_amount?: number
          tax_amount?: number
          shipping_cost?: number
          discount_amount?: number
          notes?: string | null
          terms_conditions?: string | null
          created_by?: string
          approved_by?: string | null
          approved_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          customer_code: string
          company_name: string | null
          contact_name: string
          email: string | null
          phone: string | null
          mobile: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          tax_id: string | null
          payment_terms: string
          credit_limit: number
          is_active: boolean
          customer_type: string | null
          rating: number | null
          metadata: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_code?: string
          company_name?: string | null
          contact_name: string
          email?: string | null
          phone?: string | null
          mobile?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          tax_id?: string | null
          payment_terms?: string
          credit_limit?: number
          is_active?: boolean
          customer_type?: string | null
          rating?: number | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_code?: string
          company_name?: string | null
          contact_name?: string
          email?: string | null
          phone?: string | null
          mobile?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          tax_id?: string | null
          payment_terms?: string
          credit_limit?: number
          is_active?: boolean
          customer_type?: string | null
          rating?: number | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales_orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          status: OrderStatus
          order_date: string
          required_date: string | null
          shipped_date: string | null
          total_amount: number
          tax_amount: number
          shipping_cost: number
          discount_amount: number
          payment_status: string
          shipping_address: string | null
          billing_address: string | null
          notes: string | null
          created_by: string
          approved_by: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id: string
          status?: OrderStatus
          order_date?: string
          required_date?: string | null
          shipped_date?: string | null
          total_amount?: number
          tax_amount?: number
          shipping_cost?: number
          discount_amount?: number
          payment_status?: string
          shipping_address?: string | null
          billing_address?: string | null
          notes?: string | null
          created_by: string
          approved_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string
          status?: OrderStatus
          order_date?: string
          required_date?: string | null
          shipped_date?: string | null
          total_amount?: number
          tax_amount?: number
          shipping_cost?: number
          discount_amount?: number
          payment_status?: string
          shipping_address?: string | null
          billing_address?: string | null
          notes?: string | null
          created_by?: string
          approved_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          notification_type: string
          priority: AlertPriority
          reference_id: string | null
          reference_type: string | null
          is_read: boolean
          read_at: string | null
          action_url: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          notification_type: string
          priority?: AlertPriority
          reference_id?: string | null
          reference_type?: string | null
          is_read?: boolean
          read_at?: string | null
          action_url?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          notification_type?: string
          priority?: AlertPriority
          reference_id?: string | null
          reference_type?: string | null
          is_read?: boolean
          read_at?: string | null
          action_url?: string | null
          metadata?: Json
          created_at?: string
        }
      }
    }
    Functions: {
      get_user_role: {
        Returns: UserRole
      }
      is_admin: {
        Returns: boolean
      }
      is_manager_or_admin: {
        Returns: boolean
      }
    }
  }
}
