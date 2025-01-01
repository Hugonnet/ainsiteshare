import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Button } from "./ui/button";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

export const basicFormSchema = z.object({
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

type FormData = z.infer<typeof basicFormSchema>;

interface BasicFormFieldsProps {
  form: UseFormReturn<FormData>;
}

export const BasicFormFields = ({ form }: BasicFormFieldsProps) => {
  const MAPBOX_TOKEN = "pk.eyJ1IjoiZXRpaHVnbyIsImEiOiJjbTVlOXJ4MXQwdGhmMmxzNWZvcjBhOWY5In0.QJMNqw9qgYNLs8IQBx8ESA";

  const getLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${position.coords.longitude},${position.coords.latitude}.json?access_token=${MAPBOX_TOKEN}&types=place&language=fr`
      );

      if (!response.ok) throw new Error("Erreur lors de la récupération de la ville");

      const data = await response.json();
      const city = data.features[0]?.text;
      
      if (city) {
        form.setValue("city", city);
        toast.success(`Localisation trouvée : ${city}`);
      }
    } catch (error) {
      console.error("Erreur de géolocalisation:", error);
      toast.error("Impossible de récupérer votre position");
    }
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
            <FormLabel className="text-lg">Ville de la réalisation</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input placeholder="Ville" className="text-lg" {...field} />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={getLocation}
                className="shrink-0 bg-gradient-to-r from-[#1EAEDB] via-[#8B5CF6] to-[#ea384c] hover:opacity-90 transition-opacity border-none"
              >
                <MapPin className="h-5 w-5" />
              </Button>
            </div>
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
    </>
  );
};