import { X } from "lucide-react";

interface PhotoPreviewProps {
  previews: string[];
  onRemove: (index: number) => void;
}

export const PhotoPreview = ({ previews, onRemove }: PhotoPreviewProps) => {
  if (previews.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {previews.map((preview, index) => (
        <div key={preview} className="relative aspect-square">
          <img
            src={preview}
            alt={`Aperçu ${index + 1}`}
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};