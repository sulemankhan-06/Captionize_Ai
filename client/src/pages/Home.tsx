import Header from "@/components/Header";
import Footer from "@/components/Footer";
import URLInput from "@/components/URLInput";
import ProcessingSteps from "@/components/ProcessingSteps";
import Results from "@/components/Results";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export type TranscriptionState = {
  id?: string;
  status: "idle" | "processing" | "completed" | "failed";
  sourceUrl?: string;
  progress: number;
  captions?: Array<{
    id: number;
    start: string;
    text: string;
  }>;
  error?: string;
  title?: string;
  duration?: number;
  srtContent?: string;
};

export default function Home() {
  const { toast } = useToast();
  const [transcription, setTranscription] = useState<TranscriptionState>({
    status: "idle",
    progress: 0,
  });

  const transcribeUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/transcribe", { url });
      return response.json();
    },
    onMutate: (url) => {
      setTranscription({
        status: "processing",
        sourceUrl: url,
        progress: 0,
      });
    },
    onSuccess: (data) => {
      setTranscription(prev => ({
        ...prev,
        id: data.id,
      }));

      // Poll for status if processing
      if (data.status === "processing") {
        startPolling(data.id);
      } else if (data.status === "completed") {
        // Handle completed response
        setTranscription({
          id: data.id,
          status: "completed",
          sourceUrl: data.sourceUrl,
          progress: 100,
          captions: data.captions,
          title: data.title,
          duration: data.duration,
          srtContent: data.srtContent
        });
      }
    },
    onError: (error) => {
      setTranscription(prev => ({
        ...prev,
        status: "failed",
        error: error instanceof Error ? error.message : "Failed to process URL"
      }));
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process URL",
      });
    }
  });

  const startPolling = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/transcribe/${id}`);
        const data = await response.json();
        
        // Update progress
        setTranscription(prev => ({
          ...prev,
          progress: data.progress || prev.progress,
        }));

        if (data.status === "completed") {
          clearInterval(interval);
          setTranscription({
            id: data.id,
            status: "completed",
            sourceUrl: data.sourceUrl,
            progress: 100,
            captions: data.captions,
            title: data.title,
            duration: data.duration,
            srtContent: data.srtContent
          });
        } else if (data.status === "failed") {
          clearInterval(interval);
          setTranscription(prev => ({
            ...prev,
            status: "failed",
            error: data.error || "Transcription failed"
          }));
          toast({
            variant: "destructive",
            title: "Transcription Failed",
            description: data.error || "Failed to process your video",
          });
        }
      } catch (error) {
        clearInterval(interval);
        setTranscription(prev => ({
          ...prev,
          status: "failed",
          error: "Failed to check transcription status"
        }));
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  };

  const handleURLSubmit = (url: string) => {
    transcribeUrlMutation.mutate(url);
  };

  const handleRetry = () => {
    if (transcription.sourceUrl) {
      transcribeUrlMutation.mutate(transcription.sourceUrl);
    } else {
      setTranscription({
        status: "idle",
        progress: 0,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-20 flex-grow">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-30">
            <div className="absolute top-20 left-1/3 w-72 h-72 bg-primary rounded-full filter blur-[100px]"></div>
            <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-purple-500 rounded-full filter blur-[100px]"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                Generate Perfect Captions with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">AI Precision</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Transform any video into accurately transcribed captions with our advanced AI technology. 
                Simply paste a URL and get professional-grade SRT files in seconds.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <a href="#generate" className="bg-gradient-to-r from-primary to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-lg font-medium text-lg transition-all transform hover:scale-105">
                  Try For Free
                </a>
                <button className="bg-dark-700 hover:bg-dark-600 text-gray-300 py-3 px-6 rounded-lg font-medium text-lg transition-colors flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Watch Demo
                </button>
              </div>
            </div>
            
            <div className="relative max-w-5xl mx-auto" id="generate">
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                <div className="bg-card p-6 rounded-lg">
                  <h2 className="text-xl md:text-2xl font-display font-bold mb-4 text-white">Generate Captions</h2>
                  
                  <URLInput onSubmit={handleURLSubmit} isProcessing={transcription.status === "processing"} />
                  
                  <ProcessingSteps />
                  
                  <Results 
                    transcription={transcription}
                    onRetry={handleRetry}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Features />
        <HowItWorks />
        <Pricing />
      </main>

      <Footer />
    </div>
  );
}
