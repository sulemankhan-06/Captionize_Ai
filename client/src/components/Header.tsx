import { useState } from "react";
import { Link } from "wouter";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17l10-10M4.8 19.2L19.2 4.8M7 4.8h12.4V17"></path>
          </svg>
          <div>
            <h1 className="font-display font-bold text-2xl text-white tracking-tight">
              Caption<span className="text-primary">ize</span><span className="text-purple-500">AI</span>
            </h1>
            <p className="text-xs text-muted-foreground -mt-1">Advanced Caption Generator</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button className="hidden md:block bg-dark-700 hover:bg-dark-600 text-gray-300 py-2 px-4 rounded-lg text-sm transition-colors">
            Sign In
          </button>
          <button className="bg-gradient-to-r from-primary to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all">
            Get Started
          </button>
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-gray-800">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-3">
              <a 
                href="#features" 
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it Works
              </a>
              <a 
                href="#pricing" 
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <button className="bg-dark-700 hover:bg-dark-600 text-gray-300 py-2 px-4 rounded-lg text-sm transition-colors w-full text-left mt-2">
                Sign In
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
