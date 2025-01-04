import { useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useAudioRecorder = (onAudioRecorded: (blob: Blob | null) => void) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (e: React.MouseEvent) => {
    e?.preventDefault();
    
    if (isRecording || mediaRecorderRef.current) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioRecorded(audioBlob);
        setHasRecording(true);
        setIsRecording(false);
        
        // Nettoyage
        stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current = null;
        chunksRef.current = [];
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au microphone",
        variant: "destructive",
      });
      setIsRecording(false);
    }
  };

  const stopRecording = (e: React.MouseEvent) => {
    e?.preventDefault();
    
    if (!isRecording || !mediaRecorderRef.current) {
      return;
    }

    try {
      mediaRecorderRef.current.stop();
    } catch (error) {
      console.error('Error stopping recording:', error);
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