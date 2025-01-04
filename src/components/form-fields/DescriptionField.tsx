import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../ProjectFormFields";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DescriptionFieldProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

const STORAGE_KEY = 'saved_description';

export const DescriptionField = ({ form }: DescriptionFieldProps) => {
  useEffect(() => {
    const savedDescription = localStorage.getItem(STORAGE_KEY);
    if (savedDescription) {
      form.setValue('description', savedDescription);
    }
  }, [form]);

  const handleSaveDescription = () => {
    const currentDescription = form.getValues('description');
    if (currentDescription) {
      localStorage.setItem(STORAGE_KEY, currentDescription);
      toast.success("Description sauvegardée");
    }
  };

  const handleClearSavedDescription = () => {
    localStorage.removeItem(STORAGE_KEY);
    form.setValue('description', '');
    toast.success("Description supprimée");
  };

  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center">
            <FormLabel className="text-lg">Type de prestation</FormLabel>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveDescription}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                Sauvegarder
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearSavedDescription}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Effacer
              </Button>
            </div>
          </div>
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
  );
};