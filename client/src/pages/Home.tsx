import Header from "@/components/Header";
import Footer from "@/components/Footer";
import URLInput from "@/components/URLInput";
import FileUploader from "@/components/FileUploader";
import ProcessingSteps from "@/components/ProcessingSteps";
import Results from "@/components/Results";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// Helper function to determine if a status is "processing" (not idle)
function isActiveProcessing(status: "idle" | "processing" | "completed" | "failed"): boolean {
  return status === "processing";
}

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
        
        // Update progress and keep status synchronized
        setTranscription(prev => ({
          ...prev,
          status: data.status || prev.status,
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
    // Reset to idle state with better feedback
    setTranscription({
      status: "idle",
      progress: 0,
    });
    
    // Show a toast notification to confirm reset
    toast({
      title: "Ready for a new transcription",
      description: "You can now submit a new URL or upload a file",
      duration: 3000,
    });
    
    // Scroll to top of page for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              {/* Buttons removed as requested */}
            </div>
            
            <div className="relative max-w-5xl mx-auto" id="generate">
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                <div className="bg-card p-6 rounded-lg">
                  <h2 className="text-xl md:text-2xl font-display font-bold mb-4 text-white">Generate Captions</h2>
                  
                  {transcription.status === "idle" ? (
                    <Tabs defaultValue="url" className="mb-0">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url">From URL</TabsTrigger>
                        <TabsTrigger value="file">Upload File</TabsTrigger>
                      </TabsList>
                      
                      {/* Define a local variable to satisfy TypeScript */}
                      {(() => {
                        // Using our helper function to check status
                        const isProcessingNow = isActiveProcessing(transcription.status);
                        return (
                          <>
                            <TabsContent value="url" className="mt-4">
                              <URLInput onSubmit={handleURLSubmit} isProcessing={isProcessingNow} />
                            </TabsContent>
                            <TabsContent value="file" className="mt-4">
                              <FileUploader 
                                onUploadComplete={(id) => startPolling(id)} 
                                isProcessing={isProcessingNow} 
                              />
                            </TabsContent>
                          </>
                        );
                      })()}
                    </Tabs>
                  ) : null}
                  
                  <ProcessingSteps 
                    progress={transcription.progress} 
                    status={transcription.status} 
                  />
                  
                  <Results 
                    transcription={transcription}
                    onRetry={handleRetry}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features, HowItWorks, and Pricing components removed as requested */}
      </main>

      <Footer />
    </div>
  );
}
