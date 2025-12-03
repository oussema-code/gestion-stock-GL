// ============================================================================
// Supabase Edge Function: Get User Notifications
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

interface Notification {
  id: string
  title: string
  message: string
  notification_type: string
  priority: string
  reference_id: string | null
  reference_type: string | null
  is_read: boolean
  read_at: string | null
  action_url: string | null
  metadata: Record<string, any>
  created_at: string
}

interface NotificationResponse {
  success: boolean
  data?: {
    notifications: Notification[]
    unread_count: number
    total_count: number
  }
  error?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user is authenticated
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
    const unreadOnly = url.searchParams.get('unread_only') === 'true'
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const priority = url.searchParams.get('priority')
    const notificationType = url.searchParams.get('type')

    // Build query
    let query = supabaseClient
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    if (notificationType) {
      query = query.eq('notification_type', notificationType)
    }

    // Execute query
    const { data: notifications, error: queryError, count } = await query

    if (queryError) {
      throw queryError
    }

    // Get unread count
    const { count: unreadCount } = await supabaseClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    const response: NotificationResponse = {
      success: true,
      data: {
        notifications: notifications || [],
        unread_count: unreadCount || 0,
        total_count: count || 0,
      },
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    
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
