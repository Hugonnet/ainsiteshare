import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { PhotoUpload } from "./PhotoUpload";
import { Button } from "./ui/button";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

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
  const [isLocating, setIsLocating] = useState(false);

  const getLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://api-adresse.data.gouv.fr/reverse/?lon=${position.coords.longitude}&lat=${position.coords.latitude}`
          );
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            const properties = data.features[0].properties;
            const city = properties.city;
            const postcode = properties.postcode;
            const department = postcode.substring(0, 2);
            
            form.setValue("city", city);
            form.setValue("department", department);
            toast.success("Localisation réussie !");
          } else {
            toast.error("Impossible de déterminer votre localisation");
          }
        } catch (error) {
          console.error("Erreur lors de la géolocalisation:", error);
          toast.error("Erreur lors de la récupération de la localisation");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        toast.error("Erreur lors de la géolocalisation");
        setIsLocating(false);
      }
    );
  };

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
            <FormLabel className="text-lg whitespace-nowrap">Ville de la réalisation</FormLabel>
            <FormControl>
              <Input placeholder="Ville concernée" className="text-lg" {...field} />
            </FormControl>
            <Button
              type="button"
              onClick={getLocation}
              disabled={isLocating}
              className="w-full mt-2 bg-[#39FF14] hover:bg-[#32E512] text-black font-semibold"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Me localiser
            </Button>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg">Département concerné</FormLabel>
            <FormControl>
              <Input placeholder="Exemple : 01" className="text-lg" maxLength={3} {...field} />
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
            <FormLabel className="text-lg">Type de prestation</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Décrivez brièvement votre prestation en 1 phrase ..."
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