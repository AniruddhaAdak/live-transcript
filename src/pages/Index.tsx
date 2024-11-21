import { useState, useEffect, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import { ThemeToggle } from "@/components/ThemeToggle";
import { processAudioFile, checkTranscriptionStatus } from "@/utils/audioProcessor";
import RecordingInterface from "@/components/RecordingInterface";

const ASSEMBLY_AI_API_KEY = "5b1fd20849da4dd3b981ca0f1a175209";

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [transcript, setTranscript] = useState([
    { timestamp: "0:00", text: "Click the button to start recording..." },
  ]);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setHasPermission(true);
      })
      .catch((err) => {
        setHasPermission(false);
        console.error("Initial permission check failed:", err);
      });
  }, []);

  const uploadAudioToAssemblyAI = async (audioBlob: Blob) => {
    try {
      setProcessingProgress(25);
      const file = new File([audioBlob], "recording.webm", { type: "audio/webm" });
      const transcriptId = await processAudioFile(file, ASSEMBLY_AI_API_KEY);
      
      setProcessingProgress(50);
      let result = await checkTranscriptionStatus(transcriptId, ASSEMBLY_AI_API_KEY);
      
      while (result.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = await checkTranscriptionStatus(transcriptId, ASSEMBLY_AI_API_KEY);
      }
      
      if (result.status === 'completed' && result.text) {
        setProcessingProgress(100);
        const currentTime = new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        setTranscript(prev => [...prev, {
          timestamp: currentTime,
          text: result.text,
        }]);

        toast({
          title: "Transcription complete",
          description: "Your audio has been successfully transcribed.",
        });
      }
    } catch (error) {
      setProcessingProgress(0);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process the audio. Please try again.",
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setProcessingProgress(25);
      const transcriptId = await processAudioFile(file, ASSEMBLY_AI_API_KEY);
      
      setProcessingProgress(50);
      let result = await checkTranscriptionStatus(transcriptId, ASSEMBLY_AI_API_KEY);
      
      while (result.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = await checkTranscriptionStatus(transcriptId, ASSEMBLY_AI_API_KEY);
      }
      
      if (result.status === 'completed' && result.text) {
        setProcessingProgress(100);
        const currentTime = new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        setTranscript(prev => [...prev, {
          timestamp: currentTime,
          text: result.text,
        }]);

        toast({
          title: "Transcription complete",
          description: "Your audio file has been successfully transcribed.",
        });
      }
    } catch (error) {
      setProcessingProgress(0);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process the audio file. Please try again.",
      });
    }
  };

  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        let chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          chunks = [];
          
          toast({
            title: "Processing audio",
            description: "Your audio is being transcribed...",
          });
          
          await uploadAudioToAssemblyAI(blob);
        };

        mediaRecorder.start(1000);
        setHasPermission(true);
        setIsRecording(true);
        toast({
          title: "Recording started",
          description: "Your audio is now being recorded.",
        });
      } else {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
        }
        setIsRecording(false);
      }
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setHasPermission(false);
      toast({
        variant: "destructive",
        title: "Microphone access denied",
        description: "Please enable microphone access in your browser settings and try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 animate-gradient" />
      
      <ThemeToggle />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8 animate-slide-in-right">
          <h1 className="text-4xl font-bold text-foreground mb-2">LiveTranscript+</h1>
          <p className="text-lg text-muted-foreground">Real-time audio transcription made beautiful</p>
        </div>

        <RecordingInterface 
          isRecording={isRecording}
          processingProgress={processingProgress}
          onToggleRecording={toggleRecording}
          onFileSelected={handleFileUpload}
          hasPermission={hasPermission}
        />

        <div className="animate-fade-in">
          <TranscriptDisplay lines={transcript} />
        </div>
      </div>
    </div>
  );
};

export default Index;