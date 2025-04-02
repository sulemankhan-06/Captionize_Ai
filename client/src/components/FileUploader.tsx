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
    
    // Check file size (limit to 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please upload a file smaller than 100MB.",
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
    <div className="mb-6">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={onFileInputChange}
          accept="audio/*,video/*"
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="rounded-full bg-gray-800 p-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-primary" 
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
          </div>
          <div className="text-sm text-gray-300">
            {selectedFile ? (
              <span className="font-medium">{selectedFile.name}</span>
            ) : (
              <>
                <span className="font-medium">Drag and drop</span> your file here
                <p className="mt-1 text-xs text-gray-400">
                  MP3, WAV, MP4, WebM up to 100MB
                </p>
              </>
            )}
          </div>
          
          {!selectedFile && (
            <Button 
              className="mt-4 bg-gradient-to-r from-primary to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={handleSelectFileClick}
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
                  d="M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
              Choose File
            </Button>
          )}
        </div>
      </div>
      
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}
      
      {selectedFile && !isUploading && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => setSelectedFile(null)}
            variant="outline"
            className="mr-2"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isProcessing || isUploading}
            className="bg-gradient-to-r from-primary to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {isProcessing ? "Processing..." : "Generate Captions"}
          </Button>
        </div>
      )}
    </div>
  );
}