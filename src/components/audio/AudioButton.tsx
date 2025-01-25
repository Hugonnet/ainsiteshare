import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2 } from "lucide-react";

interface AudioButtonProps {
  isRecording: boolean;
  hasRecording: boolean;
  onStartRecording: (e: React.MouseEvent) => void;
  onStopRecording: (e: React.MouseEvent) => void;
  onDeleteRecording: (e: React.MouseEvent) => void;
}

export const AudioButton = ({
  isRecording,
  hasRecording,
  onStartRecording,
  onStopRecording,
  onDeleteRecording,
}: AudioButtonProps) => {
  if (isRecording) {
    return (
      <Button
        onClick={onStopRecording}
        variant="destructive"
        type="button"
        className="h-[48px] w-full md:w-auto"
      >
        <Square className="h-4 w-4" />
        Arrêter
      </Button>
    );
  }

  if (hasRecording) {
    return (
      <Button
        onClick={onDeleteRecording}
        variant="outline"
        type="button"
        className="h-[48px] w-full md:w-auto"
      >
        <Trash2 className="h-4 w-4" />
        Supprimer
      </Button>
    );
  }

  return (
    <Button
      onClick={onStartRecording}
      type="button"
      className="gradient-button text-white font-semibold h-[48px] w-full md:w-auto"
    >
      <Mic className="h-4 w-4" />
      Enregistrer un message vocal
    </Button>
  );
};