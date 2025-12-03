// ============================================================================
// Supabase Edge Function: Get Stock Alerts
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

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

    // Parse query parameters
    const url = new URL(req.url)
    const unresolvedOnly = url.searchParams.get('unresolved_only') !== 'false'
    const priority = url.searchParams.get('priority')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Build query with product details
    let query = supabaseClient
      .from('stock_alerts')
      .select(`
        *,
        product:products (
          id,
          sku,
          name,
          category,
          unit,
          current_stock,
          min_stock,
          max_stock,
          location,
          unit_price
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (unresolvedOnly) {
      query = query.eq('is_resolved', false)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    // Execute query
    const { data: alerts, error: queryError, count } = await query

    if (queryError) {
      throw queryError
    }

    // Get counts by priority
    const { data: criticalCount } = await supabaseClient
      .from('stock_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('is_resolved', false)
      .eq('priority', 'critical')

    const { data: highCount } = await supabaseClient
      .from('stock_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('is_resolved', false)
      .eq('priority', 'high')

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          alerts: alerts || [],
          total_count: count || 0,
          critical_count: criticalCount || 0,
          high_count: highCount || 0,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error fetching stock alerts:', error)

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
