import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { JSZip } from "https://deno.land/x/jszip@0.11.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, city, description, photoPaths = [], department } = await req.json();
    console.log('Received request data:', { companyName, city, description, photoPaths, department });

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      throw new Error('Email service configuration is missing');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Getting public URLs for photos...');
    const photoUrls = await Promise.all(
      (photoPaths || []).map(async (path: string) => {
        const { data } = supabaseAdmin.storage
          .from('project_photos')
          .getPublicUrl(path);
        return { url: data.publicUrl, path };
      })
    );
    console.log('Photo URLs generated:', photoUrls);

    // Create ZIP file with photos
    const zip = new JSZip();
    
    // Download and add each photo to the ZIP
    await Promise.all(
      photoUrls.map(async ({ url, path }) => {
        const response = await fetch(url);
        const imageData = await response.arrayBuffer();
        const fileName = path.split('/').pop() || 'photo.jpg';
        zip.addFile(fileName, imageData);
      })
    );

    // Generate ZIP file
    const zipContent = await zip.generateAsync({ type: "uint8array" });
    const zipBase64 = btoa(String.fromCharCode(...new Uint8Array(zipContent)));

    const emailHtml = `
      <h2 style="color: #333; font-family: sans-serif;">Nouvelle soumission de projet</h2>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 10px 0;"><strong>Entreprise :</strong> ${companyName}</p>
        <p style="margin: 10px 0;"><strong>Ville :</strong> ${city}</p>
        ${department ? `<p style="margin: 10px 0;"><strong>Département :</strong> ${department}</p>` : ''}
        <p style="margin: 10px 0;"><strong>Description :</strong> ${description}</p>
      </div>
      
      ${photoUrls.length > 0 ? `
        <h3 style="color: #333; font-family: sans-serif;">Photos du projet :</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
          ${photoUrls.map(({ url }) => `
            <div style="text-align: center;">
              <img src="${url}" alt="Photo du projet" style="max-width: 300px; width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px;">
              <a href="${url}" target="_blank" style="display: inline-block; padding: 8px 16px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 4px; font-family: sans-serif;">
                Voir l'image
              </a>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;

    console.log('Sending email...');
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
        attachments: [{
          filename: 'photos.zip',
          content: zipBase64,
        }],
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