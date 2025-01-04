import { useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useAudioRecorder = (onAudioRecorded: (blob: Blob | null) => void) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Si un enregistrement est déjà en cours, on l'arrête
    if (isRecording) {
      await stopRecording(e);
      return;
    }

    try {
      // Nettoyage des anciennes pistes audio si elles existent
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      console.log("Requesting audio permissions...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      
      streamRef.current = stream;
      console.log("Audio permissions granted, stream created");

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          onAudioRecorded(audioBlob);
          setHasRecording(true);
          
          // Nettoyage
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          
          toast({
            title: "Succès",
            description: "Enregistrement terminé",
          });
        } catch (error) {
          console.error('Error processing recording:', error);
          toast({
            title: "Erreur",
            description: "Erreur lors du traitement de l'enregistrement",
            variant: "destructive",
          });
        } finally {
          setIsRecording(false);
        }
      };

      recorder.start();
      setIsRecording(true);
      toast({
        title: "Enregistrement",
        description: "Enregistrement en cours...",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au microphone. Vérifiez les permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      // Nettoyage immédiat des pistes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'arrêt de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setIsRecording(false);
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