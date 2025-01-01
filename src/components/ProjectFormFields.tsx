import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { PhotoUpload } from "./PhotoUpload";
import { BasicFormFields, basicFormSchema } from "./BasicFormFields";

export const formSchema = basicFormSchema;

type FormData = z.infer<typeof formSchema>;

interface ProjectFormFieldsProps {
  form: UseFormReturn<FormData>;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
}

export const ProjectFormFields = ({ form, selectedFiles, setSelectedFiles }: ProjectFormFieldsProps) => {
  return (
    <>
      <BasicFormFields form={form} />
      <div>
        <PhotoUpload 
          selectedFiles={selectedFiles}
          onPhotosChange={setSelectedFiles}
        />
      </div>
    </>
  );
};