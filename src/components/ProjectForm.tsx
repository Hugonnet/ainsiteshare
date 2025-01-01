import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase, getPhotoUrl } from "@/integrations/supabase/client";
import { useState } from "react";
import { ProjectFormFields, formSchema } from "./ProjectFormFields";
import Fireworks from "./Fireworks";
import type { z } from "zod";

const ProjectForm = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showFireworks, setShowFireworks] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      city: "",
      department: "",
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

      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('project_photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        photoPaths.push(fileName);
      }

      const { error: insertError } = await supabase
        .from('project_submissions')
        .insert({
          company_name: values.companyName,
          city: values.city,
          department: values.department,
          description: values.description,
          photo_paths: photoPaths,
        });

      if (insertError) throw insertError;

      const photoUrls = photoPaths.map(getPhotoUrl);
      
      const { error: emailError } = await supabase.functions.invoke('send-project-email', {
        body: {
          companyName: values.companyName,
          city: values.city,
          department: values.department,
          description: values.description,
          photoUrls,
        },
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
      }

      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 5000);
      
      toast.success("Projet soumis avec succès !");
      form.reset();
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error("Une erreur est survenue lors de la soumission du projet.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {showFireworks && <Fireworks />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <ProjectFormFields 
            form={form}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
          />
          <Button 
            type="submit" 
            disabled={isUploading} 
            className="w-full sm:w-auto text-lg px-8 py-6"
          >
            {isUploading ? "Envoi en cours..." : "Soumettre le projet"}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default ProjectForm;