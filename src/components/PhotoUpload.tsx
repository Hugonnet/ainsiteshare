
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PhotoButtons } from "./photo/PhotoButtons";
import { PhotoPreview } from "./photo/PhotoPreview";
import { resizeImage } from "@/utils/imageResizer";

interface PhotoUploadProps {
  onPhotosChange: (files: File[]) => void;
  selectedFiles: File[];
}

export const PhotoUpload = ({ onPhotosChange, selectedFiles }: PhotoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isPreparingCamera, setIsPreparingCamera] = useState(false);

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

  const prepareCamera = async () => {
    try {
      setIsPreparingCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { exact: "environment" } } 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.style.position = 'fixed';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.zIndex = '9999';
      document.body.appendChild(video);
      
      const captureButton = document.createElement('button');
      captureButton.innerText = 'Prendre la photo';
      captureButton.style.position = 'fixed';
      captureButton.style.bottom = '20px';
      captureButton.style.left = '50%';
      captureButton.style.transform = 'translateX(-50%)';
      captureButton.style.zIndex = '10000';
      captureButton.style.padding = '10px 20px';
      captureButton.style.backgroundColor = '#2563eb';
      captureButton.style.color = 'white';
      captureButton.style.borderRadius = '8px';
      captureButton.style.border = 'none';
      
      captureButton.onclick = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const resizedBlob = await resizeImage(file);
            const resizedFile = new File([resizedBlob], file.name, { type: file.type });
            await handleFiles([resizedFile]);
          }
          document.body.removeChild(video);
          document.body.removeChild(captureButton);
          stream.getTracks().forEach(track => track.stop());
          setIsPreparingCamera(false);
        }, 'image/jpeg');
      };
      
      document.body.appendChild(captureButton);
      video.play();
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error("Impossible d'accéder à la caméra");
      setIsPreparingCamera(false);
    }
  };

  const handleFiles = async (files: File[]) => {
    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > 10) {
      toast.error("Vous ne pouvez pas télécharger plus de 10 photos");
      return;
    }

    // Filter valid files
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        toast.error(`Le fichier ${file.name} n'est pas une image valide`);
      }
      return isValid;
    });

    // Resize each image before adding to selected files
    const resizedFiles: File[] = [];
    for (const file of validFiles) {
      try {
        const resizedBlob = await resizeImage(file);
        // Create a new File from the resized Blob, using the original file's name and type
        const resizedFile = new File([resizedBlob], file.name, { type: file.type });
        resizedFiles.push(resizedFile);
      } catch (error) {
        console.error(`Error resizing image ${file.name}:`, error);
        resizedFiles.push(file); // Fallback to original file if resizing fails
      }
    }

    const newFiles = [...selectedFiles, ...resizedFiles];
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
        className={`glass rounded-lg p-8 text-center ${isDragging ? "border-primary" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        
        <PhotoButtons 
          onFileSelect={() => document.getElementById('file-upload')?.click()}
          onCameraClick={prepareCamera}
          isPreparingCamera={isPreparingCamera}
        />

        <p className="text-sm text-muted-foreground mt-4">
          Maximum 10 photos au format PNG, JPG ou WEBP
        </p>
      </div>

      <PhotoPreview previews={previews} onRemove={removeFile} />
    </motion.div>
  );
};
