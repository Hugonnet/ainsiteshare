import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const AudioRecorder = ({ onAudioRecorded }: { onAudioRecorded: (blob: Blob | null) => void }) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Déterminer le format audio supporté
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

          // Arrêter proprement tous les tracks
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
    e.preventDefault(); // Prevent default form submission
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

  const deleteRecording = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default form submission
    setHasRecording(false);
    onAudioRecorded(null);
    toast({
      title: "Suppression",
      description: "Enregistrement supprimé",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {!isRecording && !hasRecording && (
          <Button
            onClick={startRecording}
            variant="outline"
            type="button"
          >
            <Mic className="h-4 w-4" />
            Enregistrer
          </Button>
        )}
        
        {isRecording && (
          <Button
            onClick={stopRecording}
            variant="destructive"
            type="button"
          >
            <Square className="h-4 w-4" />
            Arrêter
          </Button>
        )}
        
        {hasRecording && !isRecording && (
          <Button
            onClick={deleteRecording}
            variant="outline"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        )}
      </div>
      
      {hasRecording && (
        <p className="text-sm text-muted-foreground">
          ✓ Enregistrement audio ajouté
        </p>
      )}
    </div>
  );
};