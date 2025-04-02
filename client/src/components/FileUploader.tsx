import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface FileUploaderProps {
  onUploadComplete: (transcriptionId: string) => void;
  isProcessing: boolean;
}

export default function FileUploader({ onUploadComplete, isProcessing }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 
                        'video/mp4', 'video/mpeg', 'video/webm', 'video/quicktime'];
    
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload an audio (MP3, WAV, OGG) or video (MP4, WebM, QuickTime) file.",
      });
      return;
    }
    
    // Check file size (limit to 5GB)
    if (file.size > 5 * 1024 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please upload a file smaller than 5GB.",
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading || isProcessing) return;
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          onUploadComplete(response.id);
          setSelectedFile(null);
          setUploadProgress(0);
          toast({
            title: "Upload Complete",
            description: "Your file is now being processed for transcription.",
          });
        } else {
          const errorData = JSON.parse(xhr.responseText);
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: errorData.message || "There was an error uploading your file.",
          });
        }
        setIsUploading(false);
      };
      
      xhr.onerror = function() {
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: "There was a network error uploading your file.",
        });
        setIsUploading(false);
      };
      
      xhr.open('POST', '/api/upload', true);
      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
      setIsUploading(false);
    }
  };

  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-0">
      <div className="flex flex-col space-y-4">
        {/* Main upload area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/20' 
              : selectedFile 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-gray-500 hover:border-primary hover:bg-primary/10'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={!selectedFile ? handleSelectFileClick : undefined}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={onFileInputChange}
            accept="audio/*,video/*"
          />
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className={`rounded-full p-4 ${selectedFile ? 'bg-green-500/20' : 'bg-primary/20'}`}>
              {selectedFile ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-green-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                  />
                </svg>
              )}
            </div>
            
            <div className="text-sm text-gray-200">
              {selectedFile ? (
                <>
                  <span className="font-medium text-green-400">File selected:</span>
                  <p className="font-medium mt-1">{selectedFile.name}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <span className="font-medium text-primary">Drag and drop</span> your audio or video file
                  <p className="mt-2 text-sm text-gray-300">
                    - or -
                  </p>
                  <Button 
                    className="mt-3 bg-gradient-to-r from-primary to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    onClick={handleSelectFileClick}
                    size="lg"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 13l-3-3m0 0l-3 3m3-3v12" 
                      />
                    </svg>
                    Choose File
                  </Button>
                  <p className="mt-3 text-xs text-gray-400">
                    Supports MP3, WAV, MP4, WebM up to 5GB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Upload progress */}
        {isUploading && (
          <div className="mt-2">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Uploading file...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
        
        {/* Action buttons */}
        {selectedFile && !isUploading && (
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setSelectedFile(null)}
              variant="outline"
              disabled={isProcessing}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isProcessing || isUploading}
              className="bg-gradient-to-r from-primary to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14 5l7 7m0 0l-7 7m7-7H3" 
                    />
                  </svg>
                  Generate Captions
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}