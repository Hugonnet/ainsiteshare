import { X, ChevronLeft, ChevronRight, Link } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface PhotoPreviewProps {
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const PhotoPreview = ({
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
}: PhotoPreviewProps) => {
  const copyLink = () => {
    navigator.clipboard.writeText(photos[currentIndex]);
    toast.success("Lien copié !");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      >
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/50 hover:bg-background/70"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="absolute top-4 left-4 z-50">
              <Button variant="outline" size="icon" onClick={copyLink}>
                <Link className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={onPrevious}
                className="absolute left-4 z-50 p-2 rounded-full bg-background/50 hover:bg-background/70"
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <img
                src={photos[currentIndex]}
                alt={`Photo ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />

              <button
                onClick={onNext}
                className="absolute right-4 z-50 p-2 rounded-full bg-background/50 hover:bg-background/70"
                disabled={currentIndex === photos.length - 1}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="absolute bottom-4 text-center">
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} / {photos.length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};