
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ProjectFormFields, formSchema } from "./ProjectFormFields";
import type { z } from "zod";

interface ProjectFormProps {
  onSubmissionSuccess: (company: string, city: string) => void;
}

export function ProjectForm({ onSubmissionSuccess }: ProjectFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      city: "",
      department: "",
      projectType: "neuf",
      description: "",
    },
  });

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
        <div className="flex justify-center">
          <button 
            type="submit" 
            disabled={isUploading} 
            className="submit-button text-white font-semibold text-lg px-8 py-4 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Envoi en cours..." : "Soumettre le projet"}
          </button>
        </div>
      </form>
    </Form>
  );
}
