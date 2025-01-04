import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PhotoButtonsProps {
  onFileSelect: () => void;
  onCameraClick: () => void;
  isPreparingCamera: boolean;
}

export const PhotoButtons = ({ onFileSelect, onCameraClick, isPreparingCamera }: PhotoButtonsProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4">
      {isMobile && (
        <>
          <Button 
            onClick={onCameraClick}
            type="button"
            className="w-full"
            disabled={isPreparingCamera}
          >
            <Camera className="mr-2" />
            {isPreparingCamera ? "Préparation..." : "Prendre une photo"}
          </Button>
          <p className="text-muted-foreground">ou</p>
        </>
      )}
      <Button 
        onClick={onFileSelect}
        type="button"
        className="w-full"
      >
        <Upload className="mr-2" />
        Choisir des photos
      </Button>
    </div>
  );
};