import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { PhotoUpload } from "./PhotoUpload";

const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Le nom de l'entreprise doit contenir au moins 2 caractères.",
  }),
  city: z.string().min(2, {
    message: "La ville doit contenir au moins 2 caractères.",
  }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères.",
  }),
});

export function ProjectForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      city: "",
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

      // Upload each photo to Supabase Storage
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('project_photos')
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        photoPaths.push(fileName);
      }

      // Insert project data into the database
      const { error: insertError } = await supabase
        .from('project_submissions')
        .insert({
          company_name: values.companyName,
          city: values.city,
          description: values.description,
          photo_paths: photoPaths,
        });

      if (insertError) {
        throw insertError;
      }

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-project-email', {
        body: {
          companyName: values.companyName,
          city: values.city,
          description: values.description,
          photoPaths,
        },
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
      }

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l'entreprise</FormLabel>
              <FormControl>
                <Input placeholder="Votre entreprise" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ville de la réalisation</FormLabel>
              <FormControl>
                <Input placeholder="Ville" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description de la réalisation</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez votre réalisation..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4">
          <FormLabel>Photos</FormLabel>
          <PhotoUpload 
            selectedFiles={selectedFiles}
            onPhotosChange={setSelectedFiles}
          />
        </div>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Envoi en cours..." : "Soumettre le projet"}
        </Button>
      </form>
    </Form>
  );
}