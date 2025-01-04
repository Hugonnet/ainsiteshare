import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Resend } from 'https://esm.sh/@resend/node'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProjectData {
  companyName: string;
  city: string;
  department: string;
  description: string;
  photos: string[];
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

    const { data: projectData } = await req.json() as { data: ProjectData }
    
    const { companyName, city, department, description, photos } = projectData

    const photosList = photos.map((photo, index) => `
      <div style="margin-bottom: 20px;">
        <img src="${photo}" alt="Photo ${index + 1}" style="max-width: 100%; height: auto; border-radius: 8px;">
      </div>
    `).join('')

    const { error: emailError } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'ainsitenet@gmail.com',
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

    const { error: dbError } = await supabaseClient
      .from('project_submissions')
      .insert([
        {
          company_name: companyName,
          city,
          department,
          description,
          photo_paths: photos,
        },
      ])

    if (dbError) {
      throw new Error(`Database error: ${JSON.stringify(dbError)}`)
    }

    return new Response(
      JSON.stringify({ message: "Envoi en cours" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Error in send-project-email function: ${error.message}` }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    )
  }
})