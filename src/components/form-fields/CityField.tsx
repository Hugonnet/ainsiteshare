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
        <FormItem>
          <FormLabel className="text-lg whitespace-nowrap">Ville de la réalisation</FormLabel>
          <div className="relative">
            <FormControl>
              <Input placeholder="Ville concernée" className="text-lg pr-32" {...field} />
            </FormControl>
            <Button
              type="button"
              onClick={getLocation}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#39FF14] hover:bg-[#32E512] text-black font-semibold h-8 px-3"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Localiser
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};