import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { PhotoUpload } from "./PhotoUpload";

export const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Le nom de l'entreprise doit contenir au moins 2 caractères.",
  }),
  city: z.string().min(2, {
    message: "La ville doit contenir au moins 2 caractères.",
  }),
  department: z.string().min(1, {
    message: "Le département est requis.",
  }).max(3, {
    message: "Le numéro de département ne peut pas dépasser 3 caractères.",
  }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères.",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface ProjectFormFieldsProps {
  form: UseFormReturn<FormData>;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
}

export const ProjectFormFields = ({ form, selectedFiles, setSelectedFiles }: ProjectFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg">Nom de l'entreprise</FormLabel>
            <FormControl>
              <Input placeholder="Votre entreprise" className="text-lg" {...field} />
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
            <FormLabel className="text-lg">Ville de la réalisation</FormLabel>
            <FormControl>
              <Input placeholder="Ville" className="text-lg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg">Département</FormLabel>
            <FormControl>
              <Input placeholder="01" className="text-lg" maxLength={3} {...field} />
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
            <FormLabel className="text-lg">Description de la réalisation</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Décrivez votre réalisation..."
                className="resize-none text-lg"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-center">
        <PhotoUpload 
          selectedFiles={selectedFiles}
          onPhotosChange={setSelectedFiles}
        />
      </div>
    </>
  );
};