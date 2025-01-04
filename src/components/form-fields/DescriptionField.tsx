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
          <FormLabel className="text-lg">Type de prestation</FormLabel>
          <AudioRecorder 
            onAudioRecorded={(blob) => setAudioBlob(blob)}
            onAudioDeleted={() => setAudioBlob(null)}
          />
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