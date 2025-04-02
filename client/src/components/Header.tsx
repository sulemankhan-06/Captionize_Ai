import { Link } from "wouter";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <Link href="/">
          <div className="flex items-center transition-transform hover:scale-105 group cursor-pointer">
            {/* New logo matching SRT captions theme */}
            <div className="relative mr-3">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-purple-500 rounded-full opacity-70 blur-lg group-hover:opacity-100 group-hover:blur-xl transition-all"></div>
              <div className="relative p-2 bg-background rounded-full border border-gray-800 group-hover:border-primary/50 transition-all">
                <svg 
                  className="w-10 h-10 text-primary group-hover:text-white transition-colors" 
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor" 
                  strokeWidth="1.5"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  {/* Custom caption/subtitle icon */}
                  <rect x="2" y="5" width="20" height="14" rx="2" opacity="0.2" fill="currentColor" stroke="none"/>
                  <rect x="2" y="5" width="20" height="14" rx="2" fill="none"/>
                  <line x1="2" y1="9" x2="22" y2="9" strokeDasharray="1 1"/>
                  <line x1="8" y1="15" x2="16" y2="15" className="text-purple-500" strokeWidth="2"/>
                  <line x1="7" y1="17" x2="17" y2="17" strokeWidth="1" opacity="0.5"/>
                  <path d="M7 12h3l-2-3" className="text-primary"/>
                  <path d="M13 12h3.5l-2-3" className="text-purple-500"/>
                  <circle cx="21" cy="3.5" r="1.5" className="text-purple-500" fill="currentColor" stroke="none"/>
                  <circle cx="3" cy="20.5" r="1.5" className="text-primary" fill="currentColor" stroke="none"/>
                </svg>
              </div>
            </div>
            
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl">
                <span className="text-white">Caption</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">ize</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">AI</span>
              </h1>
              <p className="text-xs text-muted-foreground">Advanced Caption Generator</p>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
