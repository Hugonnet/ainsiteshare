import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, city, description, photoUrls, department } = await req.json();
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      throw new Error('Email service configuration is missing');
    }

    const emailHtml = `
      <h2>Nouvelle soumission de projet</h2>
      
      <p><strong>Entreprise :</strong> ${companyName}</p>
      <p><strong>Ville :</strong> ${city}</p>
      <p><strong>Département :</strong> ${department}</p>
      <p><strong>Description :</strong> ${description}</p>
      
      <h3>Photos :</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
        ${photoUrls.map(url => `
          <div style="text-align: center;">
            <img src="${url}" alt="Photo du projet" style="max-width: 100%; height: auto; margin-bottom: 8px; border-radius: 8px;">
            <a href="${url}" style="display: inline-block; padding: 8px 16px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">
              Voir en grand
            </a>
          </div>
        `).join('')}
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Resend <onboarding@resend.dev>',
        to: ['ainsitenet@gmail.com'],
        subject: `Nouvelle réalisation - ${companyName} à ${city}`,
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