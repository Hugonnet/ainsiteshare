import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { ProjectFormFields, formSchema } from "./ProjectFormFields";
import type { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { GalleryHorizontal } from "lucide-react";

interface ProjectFormProps {
  onSubmissionSuccess: (company: string, city: string) => void;
}

// Clé pour le stockage local
const FORM_STORAGE_KEY = 'savedProjectForm';

export function ProjectForm({ onSubmissionSuccess }: ProjectFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Récupération des données sauvegardées au démarrage
  const getSavedFormData = () => {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // On ne peut pas stocker les fichiers dans localStorage, donc on les réinitialise
        return parsedData;
      } catch (e) {
        console.error("Erreur lors de la récupération des données sauvegardées:", e);
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
    }
    
    return {
      companyName: "",
      city: "",
      department: "",
      projectType: "neuf",
      description: "",
    };
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getSavedFormData(),
  });

  // Sauvegarde automatique lorsque le formulaire change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (Object.values(value).some(v => v)) { // Si au moins un champ a une valeur
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(value));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (selectedFiles.length === 0) {
      toast.error("Veuillez sélectionner au moins une photo");
      return;
    }

    try {
      setIsUploading(true);
      const photoPaths: string[] = [];
      let audioPath: string | undefined;

      // Upload photos
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('project_photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        photoPaths.push(fileName);
      }

      // Upload audio if exists
      if (audioBlob) {
        const audioFileName = `${crypto.randomUUID()}.webm`;
        const { error: audioUploadError } = await supabase.storage
          .from('project_photos')
          .upload(audioFileName, audioBlob);

        if (audioUploadError) throw audioUploadError;
        audioPath = audioFileName;
      }

      const { error: insertError } = await supabase
        .from('project_submissions')
        .insert({
          company_name: values.companyName,
          city: values.city,
          department: values.department,
          project_type: values.projectType,
          description: values.description,
          photo_paths: photoPaths,
          audio_path: audioPath,
        });

      if (insertError) throw insertError;

      const { error: emailError } = await supabase.functions.invoke('send-project-email', {
        body: {
          companyName: values.companyName,
          city: values.city,
          department: values.department,
          projectType: values.projectType,
          description: values.description,
          photoPaths,
          audioPath,
        },
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
      }

      // Effacer les données sauvegardées après soumission réussie
      localStorage.removeItem(FORM_STORAGE_KEY);
      
      toast.success("Projet soumis avec succès !");
      onSubmissionSuccess(values.companyName, values.city);
      form.reset();
      setSelectedFiles([]);
      setAudioBlob(null);
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error("Une erreur est survenue lors de la soumission du projet.");
    } finally {
      setIsUploading(false);
    }
  };

  // Récupère la valeur actuelle du nom de l'entreprise
  const companyName = form.watch("companyName");
  const hasCompanyName = companyName.length >= 2;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ProjectFormFields 
          form={form}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          audioBlob={audioBlob}
          setAudioBlob={setAudioBlob}
        />
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <button 
            type="submit" 
            disabled={isUploading} 
            className="submit-button text-white font-semibold text-lg px-8 py-4 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Envoi en cours..." : "Soumettre le projet"}
          </button>
          
          {hasCompanyName && (
            <Link
              to={`/gallery?company=${encodeURIComponent(companyName)}`}
              className="flex items-center"
            >
              <Button 
                type="button" 
                variant="outline" 
                className="flex items-center gap-2 py-4 px-6"
              >
                <GalleryHorizontal size={20} />
                <span>Voir vos projets</span>
              </Button>
            </Link>
          )}
        </div>
      </form>
    </Form>
  );
}
