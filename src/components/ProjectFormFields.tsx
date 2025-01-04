import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { PhotoUpload } from "./PhotoUpload";
import { CompanyNameField } from "./form-fields/CompanyNameField";
import { CityField } from "./form-fields/CityField";
import { DepartmentField } from "./form-fields/DepartmentField";
import { DescriptionField } from "./form-fields/DescriptionField";

export const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Le nom de l'entreprise doit contenir au moins 2 caractères.",
  }),
  city: z.string().min(2, {
    message: "La ville doit contenir au moins 2 caractères.",
  }),
  department: z.string().min(1, {
    message: "Le département est requis.",
  }).max(3, {
    message: "Le numéro de département ne peut pas dépasser 3 caractères.",
  }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères.",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface ProjectFormFieldsProps {
  form: UseFormReturn<FormData>;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  audioBlob: Blob | null;
  setAudioBlob: (blob: Blob | null) => void;
}

export const ProjectFormFields = ({ 
  form, 
  selectedFiles, 
  setSelectedFiles,
  audioBlob,
  setAudioBlob
}: ProjectFormFieldsProps) => {
  return (
    <>
      <CompanyNameField form={form} />
      <CityField form={form} />
      <DepartmentField form={form} />
      <DescriptionField 
        form={form} 
        audioBlob={audioBlob}
        setAudioBlob={setAudioBlob}
      />
      <div className="flex justify-center mt-8">
        <PhotoUpload 
          selectedFiles={selectedFiles}
          onPhotosChange={setSelectedFiles}
        />
      </div>
    </>
  );
};