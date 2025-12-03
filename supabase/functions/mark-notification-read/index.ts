// ============================================================================
// Supabase Edge Function: Mark Notification as Read
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

interface MarkReadRequest {
  notification_id?: string
  notification_ids?: string[]
  mark_all?: boolean
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
    const body: MarkReadRequest = await req.json()

    let query = supabaseClient
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (body.mark_all) {
      // Mark all unread notifications as read
      const { data, error } = await query.select()

      if (error) throw error

      return new Response(
        JSON.stringify({
          success: true,
          data: { marked_count: data?.length || 0 },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else if (body.notification_ids && body.notification_ids.length > 0) {
      // Mark specific notifications as read
      const { data, error } = await query
        .in('id', body.notification_ids)
        .select()

      if (error) throw error

      return new Response(
        JSON.stringify({
          success: true,
          data: { marked_count: data?.length || 0 },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else if (body.notification_id) {
      // Mark single notification as read
      const { data, error } = await query
        .eq('id', body.notification_id)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({
          success: true,
          data: { notification: data },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing notification_id, notification_ids, or mark_all parameter',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)

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
