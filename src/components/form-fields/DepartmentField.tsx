
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../ProjectFormFields";

interface DepartmentFieldProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export const DepartmentField = ({ form }: DepartmentFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="department"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">Département concerné</FormLabel>
          <FormControl>
            <Input 
              placeholder="Exemple : 01" 
              className="text-sm placeholder:text-gray-400 h-[48px]" 
              maxLength={3} 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
