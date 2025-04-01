export default function Features() {
  return (
    <section id="features" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">Powerful Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Our AI-powered caption generator delivers professional-grade results with cutting-edge technology</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-card rounded-xl p-6 transition-transform hover:translate-y-[-5px] border border-gray-800">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl mb-2 text-white">High Accuracy</h3>
            <p className="text-muted-foreground">Our advanced AI models achieve over 98% accuracy in transcription, even with challenging audio.</p>
          </div>
          
          <div className="bg-card rounded-xl p-6 transition-transform hover:translate-y-[-5px] border border-gray-800">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl mb-2 text-white">Multi-Language Support</h3>
            <p className="text-muted-foreground">Generate captions in over 30 languages with automatic language detection and translation.</p>
          </div>
          
          <div className="bg-card rounded-xl p-6 transition-transform hover:translate-y-[-5px] border border-gray-800">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl mb-2 text-white">Noise Filtering</h3>
            <p className="text-muted-foreground">Intelligent algorithms filter out background noise and focus on speech for cleaner transcriptions.</p>
          </div>
          
          <div className="bg-card rounded-xl p-6 transition-transform hover:translate-y-[-5px] border border-gray-800">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl mb-2 text-white">Custom Timing</h3>
            <p className="text-muted-foreground">Fine-tune caption timing for perfect synchronization with your video content.</p>
          </div>
          
          <div className="bg-card rounded-xl p-6 transition-transform hover:translate-y-[-5px] border border-gray-800">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl mb-2 text-white">Multiple Formats</h3>
            <p className="text-muted-foreground">Download captions in SRT, VTT, TXT, and other popular formats for wide compatibility.</p>
          </div>
          
          <div className="bg-card rounded-xl p-6 transition-transform hover:translate-y-[-5px] border border-gray-800">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl mb-2 text-white">Editor Tools</h3>
            <p className="text-muted-foreground">Built-in editor for caption refinement, spell-checking and terminology customization.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
