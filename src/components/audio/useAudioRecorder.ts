import { useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useAudioRecorder = (onAudioRecorded: (blob: Blob | null) => void) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      console.log("Requesting audio permissions...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      
      console.log("Audio permissions granted, stream created");
      
      const mimeTypes = ['audio/webm', 'audio/mp4', 'audio/ogg'];
      let selectedMimeType = null;
      
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          console.log(`Found supported audio format: ${type}`);
          break;
        }
      }
      
      if (!selectedMimeType) {
        throw new Error("Aucun format audio supporté n'a été trouvé");
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: selectedMimeType });
          onAudioRecorded(audioBlob);
          setHasRecording(true);
          chunksRef.current = [];

          // Arrêt propre des pistes audio
          if (stream && stream.getTracks) {
            stream.getTracks().forEach(track => track.stop());
          }
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

  const stopRecording = (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        toast({
          title: "Succès",
          description: "Enregistrement terminé",
        });
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
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