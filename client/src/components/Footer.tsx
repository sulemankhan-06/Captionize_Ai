export default function Footer() {
  return (
    <footer className="bg-card border-t border-gray-800 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17l10-10M4.8 19.2L19.2 4.8M7 4.8h12.4V17"></path>
          </svg>
          <h2 className="font-display font-bold text-base text-white tracking-tight">
            Caption<span className="text-primary">ize</span><span className="text-purple-500">AI</span>
          </h2>
        </div>
        
        <p className="text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} CaptionizeAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
