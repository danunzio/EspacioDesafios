// Supabase Edge Function para crear profesionales confirmados
// Crear archivo: supabase/functions/create-professional/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, full_name, phone, specialty } = await req.json()

    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Create user with admin API (auto-confirmed)
    const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: full_name.trim(),
        role: 'professional',
      },
    })

    if (userError) throw userError

    // Create profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: userData.user.id,
        email: email.toLowerCase().trim(),
        full_name: full_name.trim(),
        phone: phone?.trim() || null,
        specialty: specialty.trim(),
        role: 'professional',
        is_active: true,
      })

    if (profileError) {
      // Rollback: delete user if profile creation fails
      await supabaseClient.auth.admin.deleteUser(userData.user.id)
      throw profileError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Profesional creado exitosamente',
        user: {
          id: userData.user.id,
          email: userData.user.email,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
