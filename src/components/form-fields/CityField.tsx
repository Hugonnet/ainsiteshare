import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

interface CityFieldProps {
  form: UseFormReturn<any>;
}

export const CityField = ({ form }: CityFieldProps) => {
  const handleLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://api-adresse.data.gouv.fr/reverse/?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await response.json();
          const city = data.features[0].properties.city;
          form.setValue("city", city);
        } catch (error) {
          toast.error("Erreur lors de la récupération de la ville");
        }
      },
      () => {
        toast.error("Impossible de récupérer votre position");
      }
    );
  };

  return (
    <FormField
      control={form.control}
      name="city"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <div className="flex flex-col space-y-1">
            <FormLabel className="text-lg">Ville</FormLabel>
            <Button
              type="button"
              onClick={handleLocation}
              className="gradient-button text-white font-medium text-base h-[48px] w-full max-w-[400px] mx-auto"
            >
              <MapPin className="h-4 w-4" />
              Me localiser
            </Button>
            <FormControl>
              <Input
                placeholder={`Cliquez sur "Me localiser"\nou entrez le nom de la ville concernée`}
                className="text-base placeholder:text-muted-foreground/50 h-[48px] whitespace-pre-wrap break-words"
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