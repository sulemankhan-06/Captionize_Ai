import { Link } from "wouter";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <Link href="/">
          <a className="flex items-center transition-transform hover:scale-105 group">
            {/* Enhanced logo with animation effects */}
            <div className="relative mr-3">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-full opacity-70 blur-sm group-hover:opacity-100 group-hover:blur transition-all"></div>
              <div className="relative p-2 bg-background rounded-full border border-gray-800 group-hover:border-primary/50 transition-all">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-8 h-8 text-primary group-hover:text-white transition-colors" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                  <line x1="8" y1="19" x2="16" y2="19"></line>
                </svg>
              </div>
            </div>
            
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white">
                Caption<span className="text-primary">ize</span><span className="text-purple-500">AI</span>
              </h1>
              <p className="text-xs text-muted-foreground">Advanced Caption Generator</p>
            </div>
          </a>
        </Link>
      </div>
    </header>
  );
}
