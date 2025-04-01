export default function ProcessingSteps() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="flex flex-col items-center bg-card/50 rounded-lg p-4 transition-all hover:bg-card">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        </div>
        <h3 className="font-display font-medium text-white text-center">Extract Audio</h3>
        <p className="text-muted-foreground text-sm text-center mt-1">We extract high-quality audio from your video</p>
      </div>
      
      <div className="flex flex-col items-center bg-card/50 rounded-lg p-4 transition-all hover:bg-card">
        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="font-display font-medium text-white text-center">AI Processing</h3>
        <p className="text-muted-foreground text-sm text-center mt-1">Our AI accurately transcribes the audio content</p>
      </div>
      
      <div className="flex flex-col items-center bg-card/50 rounded-lg p-4 transition-all hover:bg-card">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <h3 className="font-display font-medium text-white text-center">Get SRT File</h3>
        <p className="text-muted-foreground text-sm text-center mt-1">Download ready-to-use SRT caption file</p>
      </div>
    </div>
  );
}
