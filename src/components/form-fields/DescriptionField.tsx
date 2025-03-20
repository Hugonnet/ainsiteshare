
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../ProjectFormFields";
import { useEffect } from "react";
import { AudioRecorder } from "../AudioRecorder";

interface DescriptionFieldProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  audioBlob: Blob | null;
  setAudioBlob: (blob: Blob | null) => void;
}

const STORAGE_KEY = 'saved_description';

export const DescriptionField = ({ form, audioBlob, setAudioBlob }: DescriptionFieldProps) => {
  useEffect(() => {
    const savedDescription = localStorage.getItem(STORAGE_KEY);
    if (savedDescription) {
      form.setValue('description', savedDescription);
    }
  }, [form]);

  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormLabel className="text-lg">Décrivez votre prestation en 1 phrase</FormLabel>
          <AudioRecorder 
            onAudioRecorded={(blob) => {
              setAudioBlob(blob);
              if (!field.value) {
                form.setValue('description', 'Description audio enregistrée');
              }
            }}
            onAudioDeleted={() => setAudioBlob(null)}
          />
          <FormControl>
            <Textarea
              placeholder={audioBlob ? "" : "Ou bien décrivez votre prestation (Ex : Isolation murs intérieurs villa à Brion ou Ravalement façades crépi rustique à Nantua)"}
              className="resize-none text-sm placeholder:text-gray-400 min-h-[48px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
