import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, city, description, photoPaths } = await req.json();

    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get public URLs for the photos
    const photoUrls = await Promise.all(
      photoPaths.map(async (path: string) => {
        const { data } = supabaseAdmin.storage
          .from('project_photos')
          .getPublicUrl(path);
        return data.publicUrl;
      })
    );

    // Create email content
    const emailContent = `
      Nouvelle soumission de projet :
      
      Entreprise : ${companyName}
      Ville : ${city}
      Description : ${description}
      
      Photos : 
      ${photoUrls.join('\n')}
    `;

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
      body: JSON.stringify({
        from: 'Ainsite Share <onboarding@resend.dev>',
        to: ['contact@ainsite.net'],
        subject: `Nouvelle réalisation - ${companyName}`,
        text: emailContent,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to send email');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-project-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});