import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Mic, Square } from 'lucide-react';
import { toast } from 'sonner';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob) => void;
  onAudioDeleted: () => void;
}

export const AudioRecorder = ({ onAudioRecorded, onAudioDeleted }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioRecorded(audioBlob);
        setHasRecording(true);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info("Enregistrement en cours...");
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Impossible d'accéder au microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.success("Enregistrement terminé");
    }
  };

  const deleteRecording = () => {
    setHasRecording(false);
    onAudioDeleted();
    toast.success("Enregistrement supprimé");
  };

  return (
    <div className="flex gap-2 justify-start">
      {!hasRecording ? (
        <Button
          type="button"
          className="w-full h-12 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold rounded-lg"
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? (
            <>
              <Square className="h-5 w-5 mr-2" />
              Arrêter l'enregistrement
            </>
          ) : (
            <>
              <Mic className="h-5 w-5 mr-2" />
              Enregistrer un message audio
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          className="w-full h-12 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold rounded-lg"
          onClick={deleteRecording}
        >
          <Square className="h-5 w-5 mr-2" />
          Supprimer l'enregistrement
        </Button>
      )}
    </div>
  );
};
