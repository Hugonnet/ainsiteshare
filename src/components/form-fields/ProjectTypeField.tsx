
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../ProjectFormFields";
import { Label } from "@/components/ui/label";

interface ProjectTypeFieldProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export const ProjectTypeField = ({ form }: ProjectTypeFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="projectType"
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormLabel className="text-lg">Type de projet</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neuf" id="neuf" />
                <Label htmlFor="neuf" className="text-base">Projet neuf</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="renovation" id="renovation" />
                <Label htmlFor="renovation" className="text-base">Rénovation</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
