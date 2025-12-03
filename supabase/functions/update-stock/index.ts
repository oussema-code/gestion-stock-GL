// ============================================================================
// Supabase Edge Function: Create/Update Stock Movement
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

interface StockMovementRequest {
  product_id: string
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer'
  quantity: number
  reference_id?: string
  reference_type?: string
  notes?: string
  location?: string
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
    const body: StockMovementRequest = await req.json()

    // Validate required fields
    if (!body.product_id || !body.movement_type || !body.quantity) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: product_id, movement_type, quantity',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Validate quantity
    if (body.quantity <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Quantity must be greater than 0',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Check if product exists and get current stock
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('*')
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

    // For 'out' movements, check if sufficient stock is available
    if (body.movement_type === 'out' && product.current_stock < body.quantity) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Insufficient stock. Available: ${product.current_stock} ${product.unit}, Requested: ${body.quantity} ${product.unit}`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Create stock movement
    const { data: movement, error: movementError } = await supabaseClient
      .from('stock_movements')
      .insert({
        product_id: body.product_id,
        movement_type: body.movement_type,
        quantity: body.quantity,
        reference_id: body.reference_id,
        reference_type: body.reference_type,
        notes: body.notes,
        location: body.location || product.location,
        created_by: user.id,
      })
      .select(`
        *,
        product:products (
          id,
          sku,
          name,
          category,
          unit,
          current_stock
        )
      `)
      .single()

    if (movementError) {
      throw movementError
    }

    // Get updated product info
    const { data: updatedProduct } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', body.product_id)
      .single()

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          movement,
          updated_product: updatedProduct,
        },
        message: `Stock ${body.movement_type === 'in' ? 'increased' : 'decreased'} successfully`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    )
  } catch (error) {
    console.error('Error creating stock movement:', error)

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
