import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import JSZip from "https://esm.sh/jszip@3.10.1";

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
    const { companyName, city, department, description, photoPaths } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Creating ZIP file...');
    const zip = new JSZip();
    const folder = zip.folder("photos");

    if (!folder) {
      throw new Error("Failed to create folder in ZIP");
    }

    // Download and add each photo to the ZIP
    for (const path of photoPaths) {
      try {
        console.log('Processing image:', path);
        const { data, error } = await supabaseAdmin.storage
          .from('project_photos')
          .download(path);

        if (error) {
          console.error('Error downloading image:', path, error);
          continue;
        }

        if (!data) {
          console.error('No data received for image:', path);
          continue;
        }

        const arrayBuffer = await data.arrayBuffer();
        const fileName = path.split('/').pop() || 'photo.jpg';
        
        console.log(`Adding ${fileName} to ZIP, size: ${arrayBuffer.byteLength} bytes`);
        folder.file(fileName, arrayBuffer);
      } catch (error) {
        console.error('Error processing image:', path, error);
      }
    }

    console.log('Generating ZIP file...');
    const zipContent = await zip.generateAsync({
      type: "base64",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });
    
    console.log('ZIP file generated, size:', zipContent.length);

    const photoUrls = photoPaths.map(path => {
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('project_photos')
        .getPublicUrl(path);
      return publicUrl;
    });

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
      body: JSON.stringify({
        from: 'contact@ainsite.fr',
        to: ['contact@ainsite.fr'],
        subject: `Nouvelle réalisation de ${companyName} à ${city}`,
        html: `
          <h1>Nouvelle réalisation</h1>
          <p><strong>Entreprise :</strong> ${companyName}</p>
          <p><strong>Ville :</strong> ${city}</p>
          <p><strong>Département :</strong> ${department}</p>
          <p><strong>Description :</strong> ${description}</p>
          <h2>Photos</h2>
          ${photoUrls.map(url => `<img src="${url}" style="max-width: 300px; margin: 10px 0;" />`).join('')}
        `,
        attachments: [{
          filename: 'photos.zip',
          content: zipContent,
          content_type: 'application/zip',
        }],
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-project-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});