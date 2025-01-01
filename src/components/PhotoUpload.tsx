import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface PhotoUploadProps {
  onPhotosChange: (files: File[]) => void;
  selectedFiles: File[];
}

export const PhotoUpload = ({ onPhotosChange, selectedFiles }: PhotoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const updatePreviews = (files: File[]) => {
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => {
      // Cleanup old preview URLs
      prev.forEach(url => URL.revokeObjectURL(url));
      return newPreviews;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > 10) {
      toast.error("Vous ne pouvez pas télécharger plus de 10 photos");
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        toast.error(`Le fichier ${file.name} n'est pas une image valide`);
      }
      return isValid;
    });

    const newFiles = [...selectedFiles, ...validFiles];
    onPhotosChange(newFiles);
    updatePreviews(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    onPhotosChange(newFiles);
    updatePreviews(newFiles);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl mx-auto space-y-4"
    >
      <div
        className={`glass rounded-lg p-8 text-center ${
          isDragging ? "border-primary" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">
          Déposez vos photos ici
        </h3>
        <p className="text-muted-foreground mb-4">
          ou
        </p>
        <label htmlFor="file-upload">
          <Button as="span">
            Sélectionner des fichiers
          </Button>
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        <p className="text-sm text-muted-foreground mt-4">
          Maximum 10 photos au format PNG, JPG ou WEBP
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={preview} className="relative aspect-square">
              <img
                src={preview}
                alt={`Aperçu ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};