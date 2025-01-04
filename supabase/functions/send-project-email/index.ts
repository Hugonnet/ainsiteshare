import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Resend } from 'npm:resend'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProjectData {
  companyName: string;
  city: string;
  department: string;
  description: string;
  photoPaths: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { companyName, city, department, description, photoPaths } = await req.json()
    
    // Get public URLs for the photos
    const photoUrls = await Promise.all(
      photoPaths.map(async (path) => {
        const { data } = await supabaseClient.storage
          .from('project_photos')
          .getPublicUrl(path)
        return data.publicUrl
      })
    )

    const photosList = photoUrls.map((url, index) => `
      <div style="margin-bottom: 20px;">
        <img src="${url}" alt="Photo ${index + 1}" style="max-width: 100%; height: auto; border-radius: 8px;">
      </div>
    `).join('')

    const { error: emailError } = await resend.emails.send({
      from: 'Ainsite <onboarding@resend.dev>',
      to: ['onboarding@resend.dev'], // Temporarily using Resend's default email
      subject: `Nouvelle réalisation de ${companyName} à ${city}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Nouvelle réalisation</h1>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #2563eb; margin-top: 0;">${companyName}</h2>
            <p style="margin: 10px 0;"><strong>Ville:</strong> ${city}</p>
            <p style="margin: 10px 0;"><strong>Département:</strong> ${department}</p>
            <p style="margin: 10px 0;"><strong>Description:</strong></p>
            <p style="margin: 10px 0;">${description}</p>
          </div>

          <div style="margin-top: 30px;">
            <h3 style="color: #1a1a1a;">Photos de la réalisation:</h3>
            ${photosList}
          </div>
        </div>
      `,
    })

    if (emailError) {
      throw new Error(`Failed to send email: ${JSON.stringify(emailError)}`)
    }

    return new Response(
      JSON.stringify({ message: "Email envoyé avec succès" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in send-project-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    )
  }
})