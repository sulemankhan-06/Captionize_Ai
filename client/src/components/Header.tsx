import { Link } from "wouter";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <Link href="/">
          <div className="flex items-center transition-transform hover:scale-105 group cursor-pointer">
            {/* Enhanced logo with animation effects */}
            <div className="relative mr-3">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-purple-500 rounded-full opacity-70 blur-lg group-hover:opacity-100 group-hover:blur-xl transition-all"></div>
              <div className="relative p-2.5 bg-background rounded-full border border-gray-800 group-hover:border-primary/50 transition-all">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-9 h-9 text-primary group-hover:text-white transition-colors" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M17 8h1a4 4 0 110 8h-1"></path>
                  <path d="M3 8h7l1 8h-7a4 4 0 110-8z"></path>
                  <path d="M17 12v-4h1.5a2.5 2.5 0 100-5H12"></path>
                  <path d="M3 12v4h7l1-8H4a4 4 0 100 8h7"></path>
                </svg>
              </div>
            </div>
            
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
                Caption<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">ize</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">AI</span>
              </h1>
              <p className="text-xs text-muted-foreground">Advanced Caption Generator</p>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
