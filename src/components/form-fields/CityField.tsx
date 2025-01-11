import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { formSchema } from "../ProjectFormFields";

interface CityFieldProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export const CityField = ({ form }: CityFieldProps) => {
  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur");
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
        }
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        toast.error("Erreur lors de la géolocalisation");
      }
    );
  };

  return (
    <FormField
      control={form.control}
      name="city"
      render={({ field }) => (
        <FormItem className="space-y-3 md:space-y-4">
          <FormLabel className="text-lg whitespace-nowrap">Ville de la réalisation</FormLabel>
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              onClick={getLocation}
              className="gradient-button w-full text-white font-medium text-sm h-10"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Me localiser
            </Button>
            <FormControl>
              <Input 
                placeholder='Cliquez sur "Me localiser" ou entrez la ville concernée'
                className="text-sm placeholder:text-muted-foreground/50" 
                {...field} 
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};