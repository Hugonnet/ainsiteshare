import { useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useAudioRecorder = (onAudioRecorded: (blob: Blob | null) => void) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

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
        try {
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });
          onAudioRecorded(audioBlob);
          setHasRecording(true);
          chunksRef.current = [];

          if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
        } catch (error) {
          console.error('Error processing recording:', error);
          toast({
            title: "Erreur",
            description: "Erreur lors du traitement de l'enregistrement",
            variant: "destructive",
          });
        }
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      toast({
        title: "Enregistrement",
        description: "Enregistrement en cours...",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au microphone. Vérifiez les permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        toast({
          title: "Succès",
          description: "Enregistrement terminé",
        });
      } catch (error) {
        console.error('Error stopping recording:', error);
        toast({
          title: "Erreur",
          description: "Erreur lors de l'arrêt de l'enregistrement",
          variant: "destructive",
        });
      }
    }
  };

  return {
    isRecording,
    hasRecording,
    setHasRecording,
    startRecording,
    stopRecording,
  };
};