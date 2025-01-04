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
    e.stopPropagation(); // Empêcher la propagation de l'événement
    
    // Arrêter tout enregistrement en cours
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }

    try {
      console.log("Requesting audio permissions...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false // Explicitement désactiver la vidéo
      });
      
      console.log("Audio permissions granted, stream created");
      
      // Test available formats - Prioriser les formats les plus compatibles
      const mimeTypes = ['audio/mp4', 'audio/webm', 'audio/ogg'];
      let selectedMimeType = null;
      
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          console.log(`Found supported audio format: ${type}`);
          break;
        } else {
          console.log(`Format not supported: ${type}`);
        }
      }
      
      if (!selectedMimeType) {
        console.error("No supported audio format found");
        throw new Error("Aucun format audio supporté n'a été trouvé");
      }

      console.log("Creating MediaRecorder...");
      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType
      });
      
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (e) => {
        console.log("Data available event received");
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        console.log("Recording stopped");
        try {
          const audioBlob = new Blob(chunksRef.current, { type: selectedMimeType });
          console.log(`Audio blob created, size: ${audioBlob.size} bytes`);
          onAudioRecorded(audioBlob);
          setHasRecording(true);
          chunksRef.current = [];

          stream.getTracks().forEach(track => {
            track.stop();
            console.log("Audio track stopped");
          });
        } catch (error) {
          console.error('Error processing recording:', error);
          toast({
            title: "Erreur",
            description: "Erreur lors du traitement de l'enregistrement",
            variant: "destructive",
          });
        }
      };

      recorder.start(100);
      console.log("Recording started");
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
    e.stopPropagation(); // Empêcher la propagation de l'événement
    
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