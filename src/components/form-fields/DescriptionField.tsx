import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../ProjectFormFields";

interface DescriptionFieldProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export const DescriptionField = ({ form }: DescriptionFieldProps) => {
  return (
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
  );
};