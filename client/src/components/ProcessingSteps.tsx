import { Progress } from "@/components/ui/progress";

interface ProcessingStepsProps {
  progress?: number;
  status?: "idle" | "processing" | "completed" | "failed";
}

export default function ProcessingSteps({ progress = 0, status = "idle" }: ProcessingStepsProps) {
  const step1Active = status === "processing" && progress < 35;
  const step2Active = status === "processing" && progress >= 35 && progress < 75;
  const step3Active = status === "processing" && progress >= 75;
  const allComplete = status === "completed";
  
  return (
    <div className="mb-4">
      {status === "processing" && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Processing Progress</span>
            <span className="text-primary font-medium">{progress}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-background"
          />
          <p className="text-sm text-gray-400 mt-2 text-center">
            {progress < 35 && "Downloading and extracting audio..."}
            {progress >= 35 && progress < 75 && "Processing audio with AI..."}
            {progress >= 75 && progress < 95 && "Generating transcription..."}
            {progress >= 95 && "Finalizing captions..."}
          </p>
        </div>
      )}
    
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`flex flex-col items-center ${step1Active || allComplete ? 'bg-primary/10' : 'bg-card/50'} rounded-lg p-4 transition-all hover:bg-card border ${step1Active ? 'border-primary/50' : 'border-transparent'}`}>
          <div className={`w-12 h-12 rounded-full ${step1Active || allComplete ? 'bg-primary/30' : 'bg-primary/20'} flex items-center justify-center mb-3`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${step1Active ? 'text-primary animate-pulse' : 'text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
          <h3 className="font-display font-medium text-white text-center">Extract Audio</h3>
          <p className="text-muted-foreground text-sm text-center mt-1">We extract high-quality audio from your video</p>
        </div>
        
        <div className={`flex flex-col items-center ${step2Active || allComplete ? 'bg-purple-500/10' : 'bg-card/50'} rounded-lg p-4 transition-all hover:bg-card border ${step2Active ? 'border-purple-500/50' : 'border-transparent'}`}>
          <div className={`w-12 h-12 rounded-full ${step2Active || allComplete ? 'bg-purple-500/30' : 'bg-purple-500/20'} flex items-center justify-center mb-3`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${step2Active ? 'text-purple-500 animate-pulse' : 'text-purple-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="font-display font-medium text-white text-center">AI Processing</h3>
          <p className="text-muted-foreground text-sm text-center mt-1">Our AI accurately transcribes the audio content</p>
        </div>
        
        <div className={`flex flex-col items-center ${step3Active || allComplete ? 'bg-primary/10' : 'bg-card/50'} rounded-lg p-4 transition-all hover:bg-card border ${step3Active ? 'border-primary/50' : 'border-transparent'}`}>
          <div className={`w-12 h-12 rounded-full ${step3Active || allComplete ? 'bg-primary/30' : 'bg-primary/20'} flex items-center justify-center mb-3`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${step3Active ? 'text-primary animate-pulse' : 'text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h3 className="font-display font-medium text-white text-center">Get SRT File</h3>
          <p className="text-muted-foreground text-sm text-center mt-1">Download ready-to-use SRT caption file</p>
        </div>
      </div>
    </div>
  );
}
