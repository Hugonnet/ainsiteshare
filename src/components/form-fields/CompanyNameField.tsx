
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../ProjectFormFields";

interface CompanyNameFieldProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export const CompanyNameField = ({ form }: CompanyNameFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="companyName"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">Nom de votre entreprise</FormLabel>
          <FormControl>
            <Input 
              placeholder="Votre entreprise" 
              className="text-base placeholder:text-gray-400 h-[48px]" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
