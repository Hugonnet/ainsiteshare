import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, X } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface PhotoUploadProps {
  onPhotosChange: (files: File[]) => void;
  selectedFiles: File[];
}

export const PhotoUpload = ({ onPhotosChange, selectedFiles }: PhotoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const isMobile = useIsMobile();

  const updatePreviews = (files: File[]) => {
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return newPreviews;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          handleFiles([file]);
        }
        stream.getTracks().forEach(track => track.stop());
      }, 'image/jpeg');
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error("Impossible d'accéder à la caméra");
    }
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
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <input
            id="file-upload"
            type="file"
            className="hidden"
            multiple
            capture={isMobile ? undefined : undefined}
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button 
            onClick={() => document.getElementById('file-upload')?.click()}
            type="button"
          >
            <Upload className="mr-2" />
            Sélectionner des fichiers
          </Button>
          <Button 
            onClick={handleCameraCapture}
            type="button"
            variant="secondary"
          >
            <Camera className="mr-2" />
            Prendre une photo
          </Button>
        </div>
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