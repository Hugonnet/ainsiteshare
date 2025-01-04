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
      // Configuration spécifique pour une meilleure compatibilité mobile
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Utilisation de différents types MIME selon la compatibilité du navigateur
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg';

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        onAudioRecorded(audioBlob);
        setHasRecording(true);
        chunksRef.current = [];

        // S'assurer que tous les tracks sont bien arrêtés
        if (mediaRecorderRef.current?.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      };

      // Démarrer l'enregistrement avec un intervalle plus court pour les chunks
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      toast.info("Enregistrement en cours...");
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Impossible d'accéder au microphone. Vérifiez les permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        toast.success("Enregistrement terminé");
      } catch (error) {
        console.error('Error stopping recording:', error);
        toast.error("Erreur lors de l'arrêt de l'enregistrement");
      }
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