// ============================================================================
// Supabase Edge Function: Create Purchase Request
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

interface PurchaseRequestData {
  product_id: string
  quantity: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
  notes?: string
  required_by_date?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Parse request body
    const body: PurchaseRequestData = await req.json()

    // Validate required fields
    if (!body.product_id || !body.quantity) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: product_id and quantity',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Get product details
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('*, supplier:suppliers(*)')
      .eq('id', body.product_id)
      .single()

    if (productError || !product) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Product not found',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Create purchase request
    const { data: purchaseRequest, error: createError } = await supabaseClient
      .from('purchase_requests')
      .insert({
        product_id: body.product_id,
        quantity: body.quantity,
        urgency: body.urgency || 'medium',
        notes: body.notes,
        required_by_date: body.required_by_date,
        status: 'pending',
        requested_by: user.id,
      })
      .select(`
        *,
        product:products(
          id,
          name,
          sku,
          unit,
          unit_price,
          supplier:suppliers(*)
        ),
        requested_by_user:user_profiles!purchase_requests_requested_by_fkey(
          id,
          full_name,
          email
        )
      `)
      .single()

    if (createError) {
      throw createError
    }

    // Create notification for managers
    const { data: managers } = await supabaseClient
      .from('user_profiles')
      .select('id')
      .in('role', ['admin', 'manager'])

    if (managers && managers.length > 0) {
      const notifications = managers.map((manager) => ({
        user_id: manager.id,
        notification_type: 'purchase_request_created',
        title: 'New Purchase Request',
        message: `${user.email} created a purchase request for ${product.name} (${body.quantity} ${product.unit})`,
        priority: body.urgency === 'critical' ? 'high' : body.urgency === 'high' ? 'medium' : 'low',
        reference_id: purchaseRequest.id,
        reference_type: 'purchase_request',
        action_url: `/purchases/requests/${purchaseRequest.id}`,
      }))

      await supabaseClient.from('notifications').insert(notifications)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { purchase_request: purchaseRequest },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    )
  } catch (error) {
    console.error('Error creating purchase request:', error)

    const errorMessage = error instanceof Error ? error.message : 'Internal server error'

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
