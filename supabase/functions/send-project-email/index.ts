import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/@resend/node";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, city, department, description, photoPaths } = await req.json();

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const zip = new JSZip();
    const folder = zip.folder("photos");
    
    console.log('Processing photos...');
    for (const path of photoPaths) {
      try {
        console.log('Getting public URL for:', path);
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('project_photos')
          .getPublicUrl(path);
        
        console.log('Downloading image from:', publicUrl);
        const response = await fetch(publicUrl);
        if (!response.ok) {
          throw new Error(`Failed to download image ${path}: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const fileName = path.split('/').pop() || 'photo.jpg';
        
        console.log(`Adding ${fileName} to ZIP, size: ${arrayBuffer.byteLength} bytes`);
        folder.file(fileName, arrayBuffer);
      } catch (error) {
        console.error('Error processing image:', path, error);
      }
    }

    console.log('Generating ZIP file...');
    const zipContent = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });
    
    console.log('ZIP file generated, size:', zipContent.length);
    const zipBase64 = btoa(String.fromCharCode(...new Uint8Array(zipContent)));

    const photoUrls = photoPaths.map(path => {
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('project_photos')
        .getPublicUrl(path);
      return publicUrl;
    });

    const { error } = await resend.emails.send({
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
        content: zipBase64,
      }],
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});