import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { PhotoPreview } from "./PhotoPreview";
import { processImage } from "@/utils/imageUtils";

interface PhotoUploadProps {
  onPhotosChange: (files: File[]) => void;
  selectedFiles: File[];
}

export const PhotoUpload = ({ onPhotosChange, selectedFiles }: PhotoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  const updatePreviews = (files: File[]) => {
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return newPreviews;
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    await handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
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

    if (validFiles.length === 0) return;

    setIsProcessing(true);
    try {
      const processedFiles = await Promise.all(validFiles.map(processImage));
      const newFiles = [...selectedFiles, ...processedFiles];
      onPhotosChange(newFiles);
      updatePreviews(newFiles);
    } catch (error) {
      console.error("Erreur lors du traitement des images:", error);
      toast.error("Une erreur est survenue lors du traitement des images");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
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
        className={`glass rounded-lg p-4 sm:p-8 text-center ${
          isDragging ? "border-primary" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-muted-foreground" />
        <h3 className="text-lg sm:text-xl font-semibold mb-2">
          {isProcessing ? "Traitement des images..." : "Déposez vos photos ici"}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          ou
        </p>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          capture="environment"
        />
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button 
            onClick={() => document.getElementById('file-upload')?.click()}
            type="button"
            className="w-full sm:w-auto"
            disabled={isProcessing}
          >
            Sélectionner des fichiers
          </Button>
          <Button
            onClick={() => {
              const input = document.getElementById('file-upload') as HTMLInputElement;
              input.setAttribute('capture', 'environment');
              input.click();
            }}
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isProcessing}
          >
            Prendre une photo
          </Button>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-4">
          Maximum 10 photos au format PNG, JPG ou WEBP
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
          {previews.map((preview, index) => (
            <div key={preview} className="relative aspect-square">
              <img
                src={preview}
                alt={`Aperçu ${index + 1}`}
                className="w-full h-full object-cover rounded-lg cursor-pointer"
                onClick={() => setPreviewIndex(index)}
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

      {previewIndex !== -1 && (
        <PhotoPreview
          photos={previews}
          currentIndex={previewIndex}
          onClose={() => setPreviewIndex(-1)}
          onNext={() => setPreviewIndex(prev => Math.min(prev + 1, previews.length - 1))}
          onPrevious={() => setPreviewIndex(prev => Math.max(prev - 1, 0))}
        />
      )}
    </motion.div>
  );
};