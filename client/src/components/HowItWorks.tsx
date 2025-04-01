export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Our advanced AI technology makes generating professional captions simple and fast</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="hidden md:block absolute top-0 bottom-0 left-16 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full"></div>
            
            {/* Step 1 */}
            <div className="relative flex flex-col md:flex-row gap-8 mb-12">
              <div className="md:w-32 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center mb-2 z-10">1</div>
                <div className="hidden md:block h-full w-1 bg-transparent"></div>
              </div>
              
              <div className="flex-grow md:pt-2">
                <h3 className="font-display font-bold text-2xl mb-3 text-white">Paste Video URL</h3>
                <p className="text-muted-foreground mb-4">Simply copy and paste the URL of your video from YouTube, Vimeo, or any supported social media platform into our generator.</p>
                <div className="bg-background rounded-lg border border-gray-800 p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </div>
                    <p className="text-gray-300 font-mono text-sm overflow-x-auto whitespace-nowrap">https://www.youtube.com/watch?v=example</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative flex flex-col md:flex-row gap-8 mb-12">
              <div className="md:w-32 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center mb-2 z-10">2</div>
                <div className="hidden md:block h-full w-1 bg-transparent"></div>
              </div>
              
              <div className="flex-grow md:pt-2">
                <h3 className="font-display font-bold text-2xl mb-3 text-white">AI Audio Extraction</h3>
                <p className="text-muted-foreground mb-4">Our system automatically extracts high-quality audio from your video using RapidAPI's social-download-all-in-one service.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg border border-gray-800 p-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center mr-3 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Video Detection</h4>
                        <p className="text-muted-foreground text-sm">Source identification and metadata extraction</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background rounded-lg border border-gray-800 p-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center mr-3 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Audio Extraction</h4>
                        <p className="text-muted-foreground text-sm">High-quality isolated audio stream preparation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative flex flex-col md:flex-row gap-8 mb-12">
              <div className="md:w-32 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center mb-2 z-10">3</div>
                <div className="hidden md:block h-full w-1 bg-transparent"></div>
              </div>
              
              <div className="flex-grow md:pt-2">
                <h3 className="font-display font-bold text-2xl mb-3 text-white">AI Transcription</h3>
                <p className="text-muted-foreground mb-4">AssemblyAI's powerful speech recognition technology precisely converts audio to text with timestamps.</p>
                <div className="rounded-lg bg-background border border-gray-800 p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="h-2 flex-grow bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-primary to-purple-500"></div>
                    </div>
                    <span className="text-muted-foreground text-sm">2:48 / 3:42</span>
                  </div>
                  
                  <div className="flex items-start gap-3 mb-4">
                    <div className="min-w-[70px] text-xs text-muted-foreground font-mono mt-1">00:02:35</div>
                    <p className="text-white">The neural network architecture we're using has three hidden layers with ReLU activation functions.</p>
                  </div>
                  
                  <div className="flex items-start gap-3 py-2 border-t border-b border-gray-800 bg-card/50">
                    <div className="min-w-[70px] text-xs text-primary font-mono mt-1">00:02:48</div>
                    <p className="text-primary">This provides better performance for our image classification task</p>
                  </div>
                  
                  <div className="flex items-start gap-3 mt-4">
                    <div className="min-w-[70px] text-xs text-muted-foreground font-mono mt-1">00:03:02</div>
                    <p className="text-muted-foreground">Let's look at how this performs on our test dataset...</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="relative flex flex-col md:flex-row gap-8">
              <div className="md:w-32 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center mb-2 z-10">4</div>
              </div>
              
              <div className="flex-grow md:pt-2">
                <h3 className="font-display font-bold text-2xl mb-3 text-white">Get Your SRT File</h3>
                <p className="text-muted-foreground mb-4">Review the generated captions and download them as an SRT file ready to use with your video.</p>
                <div className="bg-background rounded-lg border border-gray-800 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white font-medium">video_transcript.srt</span>
                    </div>
                    <button className="bg-gradient-to-r from-primary to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all transform hover:scale-105 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download SRT
                    </button>
                  </div>
                  <div className="bg-card p-4 rounded-lg font-mono text-sm text-muted-foreground overflow-x-auto">
                    <pre>{`1
00:00:05,200 --> 00:00:13,450
Hi everyone, welcome to this tutorial where we'll learn about advanced machine learning techniques.

2
00:00:13,450 --> 00:00:21,800
Today we're focusing on neural networks and how they can be implemented in real-world applications.

3
00:00:21,800 --> 00:00:34,100
Let's start by understanding what neural networks actually are and how they mimic biological processes.`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
