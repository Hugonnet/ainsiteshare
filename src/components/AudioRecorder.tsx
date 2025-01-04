import { AudioButton } from "./audio/AudioButton";
import { useAudioRecorder } from "./audio/useAudioRecorder";

interface AudioRecorderProps {
  onAudioRecorded: (blob: Blob | null) => void;
  onAudioDeleted?: () => void;
}

export const AudioRecorder = ({ onAudioRecorded, onAudioDeleted }: AudioRecorderProps) => {
  const {
    isRecording,
    hasRecording,
    setHasRecording,
    startRecording,
    stopRecording,
  } = useAudioRecorder(onAudioRecorded);

  const deleteRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    setHasRecording(false);
    onAudioRecorded(null);
    onAudioDeleted?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <AudioButton
          isRecording={isRecording}
          hasRecording={hasRecording}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onDeleteRecording={deleteRecording}
        />
      </div>
      
      {hasRecording && (
        <p className="text-sm text-muted-foreground">
          ✓ Enregistrement audio ajouté
        </p>
      )}
    </div>
  );
};