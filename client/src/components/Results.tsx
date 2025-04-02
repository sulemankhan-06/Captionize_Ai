import React from "react";
import { TranscriptionState } from "@/pages/Home";
import { formatDuration, formatTimestamp } from "@/lib/utils";

interface ResultsProps {
  transcription: TranscriptionState;
  onRetry: () => void;
}

export default function Results({ transcription, onRetry }: ResultsProps) {
  const downloadSrt = () => {
    if (!transcription.srtContent) return;
    
    const blob = new Blob([transcription.srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${transcription.title || 'captions'}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-background rounded-lg border border-gray-800 p-5">
      {/* Processing State */}
      {transcription.status === "processing" && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-purple-500 border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-4 rounded-full bg-card flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-white">{transcription.progress}%</span>
            </div>
          </div>
          <h3 className="text-xl font-display font-medium text-white mb-2">Processing Your Video</h3>
          <p className="text-muted-foreground text-center max-w-md">
            We're extracting audio and generating accurate captions. 
            This usually takes about 2-3 minutes depending on video length.
          </p>
          
          <div className="w-full max-w-md mt-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>
                {transcription.progress < 40 && "Extracting audio..."}
                {transcription.progress >= 40 && transcription.progress < 80 && "Processing audio..."}
                {transcription.progress >= 80 && "Generating captions..."}
              </span>
              <span>
                {transcription.progress < 40 && "Step 1/3"}
                {transcription.progress >= 40 && transcription.progress < 80 && "Step 2/3"}
                {transcription.progress >= 80 && "Step 3/3"}
              </span>
            </div>
            <div className="h-2 w-full bg-card rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                style={{ width: `${transcription.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Initial State */}
      {transcription.status === "idle" && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 mb-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-medium text-white mb-2">No Captions Generated Yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Enter a video URL above and click "Generate Captions" to start the process.
            Your captions will appear here.
          </p>
        </div>
      )}
      
      {/* Completed State */}
      {transcription.status === "completed" && transcription.captions && (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-gray-700">
            <div>
              <div className="flex items-center">
                <h3 className="text-lg font-display font-medium text-white mr-3">Preview Captions</h3>
                {transcription.duration && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md">
                    {formatDuration(transcription.duration)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Generated from: <span className="text-gray-300">{transcription.sourceUrl}</span></p>
            </div>
            
            <div className="flex mt-3 md:mt-0 gap-3">
              <button 
                className="bg-card hover:bg-gray-700 text-gray-300 py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2"
                onClick={onRetry}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                New Transcription
              </button>
              <button 
                className="bg-gradient-to-r from-primary to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                onClick={downloadSrt}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download SRT
              </button>
            </div>
          </div>
          
          <div className="mt-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col space-y-6 font-mono">
              {transcription.captions.map((caption) => (
                <div key={caption.id} className="flex flex-col bg-card/40 p-4 rounded-md border border-gray-800">
                  <span className="text-white mb-1">{caption.id}</span>
                  <span className="text-primary text-sm mb-3">
                    {formatTimestamp(caption.start)} --&gt; {formatTimestamp(caption.end)}
                  </span>
                  <p className="text-gray-300">{caption.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {transcription.status === "failed" && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-red-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-medium text-white mb-2">Processing Error</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {transcription.error || "We couldn't process this video URL. This might be due to an invalid URL or the video might be private or restricted."}
          </p>
          <button 
            className="mt-6 bg-card hover:bg-gray-700 text-gray-300 py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2"
            onClick={onRetry}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
