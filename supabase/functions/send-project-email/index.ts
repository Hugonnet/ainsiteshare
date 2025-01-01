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
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      throw new Error('Email service configuration is missing');
    }

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

    // Create email content with HTML formatting
    const emailHtml = `
      <h2>Nouvelle soumission de projet</h2>
      
      <p><strong>Entreprise :</strong> ${companyName}</p>
      <p><strong>Ville :</strong> ${city}</p>
      <p><strong>Description :</strong> ${description}</p>
      
      <h3>Photos :</h3>
      <ul>
        ${photoUrls.map(url => `<li><a href="${url}">Voir la photo</a></li>`).join('\n')}
      </ul>
    `;

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Ainsite Share <onboarding@resend.dev>',
        to: ['contact@ainsite.net'],
        subject: `Nouvelle réalisation - ${companyName}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error('Resend API error:', errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const data = await res.json();
    console.log('Email sent successfully:', data);

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