import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { z } from "zod";
import { urlSchema } from "../shared/schema";
import { downloadVideoFromUrl, cleanupFile } from "./services/ytDlp";
import { transcribeAudio, getTranscriptionStatus } from "./services/assemblyAi";
import { formatToSRT } from "./utils/srtFormatter";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

// Ensure directories exist for audio/video files
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const TEMP_DIR = path.join(tmpdir(), 'captionize-ai');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Configure multer for file uploads
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow audio and video files
    const validMimeTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
      'video/mp4', 'video/mpeg', 'video/webm', 'video/quicktime'
    ];
    
    if (validMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio and video files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Route to handle file uploads
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      console.log(`Processing uploaded file: ${req.file.path}`);
      
      // Create a new transcription record to track progress
      const newTranscription = await dbStorage.createTranscription({
        sourceUrl: `file://${req.file.originalname}`,
        title: `Uploaded file: ${req.file.originalname}`
      });
      
      // Update with initial progress
      await dbStorage.updateTranscription(newTranscription.id, {
        progress: 40 // Skip the download step as file is already uploaded
      });
      
      // Send audio to AssemblyAI for transcription
      console.log(`Sending uploaded file to AssemblyAI for transcription`);
      
      try {
        const transcriptionId = await transcribeAudio(req.file.path);
        
        // Update transcription with AssemblyAI ID and progress
        await dbStorage.updateTranscription(newTranscription.id, {
          metadata: { 
            assemblyAiId: transcriptionId,
            originalFilename: req.file.originalname,
            originalFilePath: req.file.path
          },
          progress: 66 // Indicate progress after submission to AssemblyAI
        });
        
        // Return the transcription ID and initial status
        res.status(200).json({
          id: newTranscription.id,
          status: "processing",
          sourceUrl: `file://${req.file.originalname}`,
          progress: 66,
          title: `Uploaded file: ${req.file.originalname}`
        });
        
        // Note: We don't clean up the file immediately as it may be needed for retry
      } catch (apiError: any) {
        console.error('Error with AssemblyAI transcription:', apiError);
        
        // Handle authorization issues
        if (apiError.message && (
            apiError.message.includes('authorization') || 
            apiError.message.includes('Unauthorized') || 
            apiError.message.includes('API key')
          )) {
          await dbStorage.updateTranscription(newTranscription.id, {
            status: "failed",
            error: "Authorization failed with transcription service. Please check API key."
          });
          
          res.status(401).json({ 
            message: "Authorization failed with transcription service. Please check API key.",
            id: newTranscription.id,
            status: "failed"
          });
          return;
        }
        
        // Handle other API errors
        await dbStorage.updateTranscription(newTranscription.id, {
          status: "failed",
          error: `Transcription service error: ${apiError.message || 'Unknown error'}`
        });
        
        res.status(500).json({ 
          message: "Failed to process audio with transcription service",
          error: apiError.message || 'Unknown error',
          id: newTranscription.id,
          status: "failed"
        });
        
        // Clean up the file on error
        cleanupFile(req.file.path);
      }
    } catch (error) {
      console.error('Error processing file upload:', error);
      res.status(500).json({ 
        message: "An error occurred while processing your file",
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Clean up the file if it exists
      if (req.file) {
        cleanupFile(req.file.path);
      }
    }
  });
  // Route to handle transcription requests
  app.post('/api/transcribe', async (req, res) => {
    try {
      // Validate URL
      const validateUrl = urlSchema.safeParse(req.body);
      
      if (!validateUrl.success) {
        return res.status(400).json({ message: "Invalid URL" });
      }
      
      const { url } = validateUrl.data;
      console.log(`Processing transcription request for URL: ${url}`);
      
      // Create a new transcription record first to track progress
      const newTranscription = await dbStorage.createTranscription({
        sourceUrl: url,
        title: "Processing..."
      });
      
      // First step: Download video and extract audio using yt-dlp
      console.log(`Downloading video from ${url} using yt-dlp`);
      
      // Download video and extract audio
      const metadata = await downloadVideoFromUrl(url);
      const tempAudioPath = metadata.filePath;
      
      if (!metadata || !fs.existsSync(tempAudioPath)) {
        // Update transcription status to failed
        await dbStorage.updateTranscription(newTranscription.id, {
          status: "failed",
          error: "Failed to extract audio from the provided URL"
        });
        
        return res.status(400).json({ 
          message: "Failed to extract audio from the provided URL" 
        });
      }
      
      // Update transcription with metadata
      await dbStorage.updateTranscription(newTranscription.id, {
        title: metadata.title || "Video Transcription",
        duration: metadata.duration,
        progress: 33 // Indicate progress after audio extraction
      });
      
      // Second step: Send audio to AssemblyAI for transcription
      console.log(`Sending audio to AssemblyAI for transcription`);
      
      try {
        const transcriptionId = await transcribeAudio(tempAudioPath);
        
        // Update transcription with AssemblyAI ID and progress
        await dbStorage.updateTranscription(newTranscription.id, {
          metadata: { assemblyAiId: transcriptionId },
          progress: 66 // Indicate progress after submission to AssemblyAI
        });
      } catch (apiError: any) {
        console.error('Error with AssemblyAI transcription:', apiError);
        
        // Handle authorization issues specifically
        if (apiError.message && (
            apiError.message.includes('authorization') || 
            apiError.message.includes('Unauthorized') || 
            apiError.message.includes('API key')
          )) {
          await dbStorage.updateTranscription(newTranscription.id, {
            status: "failed",
            error: "Authorization failed with transcription service. Please check API key."
          });
          
          res.status(401).json({ 
            message: "Authorization failed with transcription service. Please check API key.",
            id: newTranscription.id,
            status: "failed"
          });
          return;
        }
        
        // Handle other API errors
        await dbStorage.updateTranscription(newTranscription.id, {
          status: "failed",
          error: `Transcription service error: ${apiError.message || 'Unknown error'}`
        });
        
        res.status(500).json({ 
          message: "Failed to process audio with transcription service",
          error: apiError.message || 'Unknown error',
          id: newTranscription.id,
          status: "failed"
        });
        return;
      }
      
      // Return the transcription ID and initial status
      res.status(200).json({
        id: newTranscription.id,
        status: "processing",
        sourceUrl: url,
        progress: 66,
        title: metadata.title || "Video Transcription"
      });
      
      // Clean up temporary file
      console.log(`Cleaning up temporary file ${tempAudioPath}`);
      cleanupFile(tempAudioPath);
      
    } catch (error) {
      console.error('Error processing transcription request:', error);
      res.status(500).json({ 
        message: "An error occurred while processing your request",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Route to check transcription status
  app.get('/api/transcribe/:id', async (req, res) => {
    try {
      const transcriptionId = req.params.id;
      
      // First get our stored transcription
      const storedTranscription = await dbStorage.getTranscription(transcriptionId);
      
      if (!storedTranscription) {
        return res.status(404).json({ message: "Transcription not found" });
      }
      
      // Get the AssemblyAI transcription ID from metadata
      const assemblyAiId = storedTranscription.metadata?.assemblyAiId as string;
      
      if (!assemblyAiId) {
        return res.status(400).json({ 
          status: "failed",
          error: "Missing AssemblyAI transcription ID"
        });
      }
      
      // Get transcription status from AssemblyAI
      console.log(`Checking status for AssemblyAI transcription ${assemblyAiId}`);
      const transcriptionResult = await getTranscriptionStatus(assemblyAiId);
      
      // Add debugging for timestamp inspection
      if (transcriptionResult?.words && transcriptionResult.words.length > 0) {
        const firstWord = transcriptionResult.words[0];
        const lastWord = transcriptionResult.words[transcriptionResult.words.length - 1];
        console.log(`DEBUG: First word timestamp - start: ${firstWord.start}s, end: ${firstWord.end}s`);
        console.log(`DEBUG: Last word timestamp - start: ${lastWord.start}s, end: ${lastWord.end}s`);
        console.log(`DEBUG: Audio duration from API: ${transcriptionResult.audio_duration}s`);
      }
      
      if (!transcriptionResult) {
        await dbStorage.updateTranscription(transcriptionId, {
          status: "failed",
          error: "Transcription not found at AssemblyAI"
        });
        
        return res.status(404).json({ 
          message: "Transcription not found at AssemblyAI"
        });
      }
      
      if (transcriptionResult.status === "error") {
        const errorMsg = "Transcription failed: " + (transcriptionResult.error || "Unknown error");
        
        // Update our stored transcription
        await dbStorage.updateTranscription(transcriptionId, {
          status: "failed",
          error: errorMsg
        });
        
        return res.status(400).json({ 
          status: "failed",
          error: errorMsg
        });
      }
      
      if (transcriptionResult.status === "completed") {
        // Format the transcription results to display and SRT format
        const words = transcriptionResult.words || [];
        
        // Group words into captions (roughly 5-10 words per caption)
        const captions: Array<{id: number, start: string, end: string, text: string}> = [];
        
        interface CaptionWord {
          text: string;
          start: number;
          end: number;
          confidence: number;
        }
        
        let currentCaption: {
          id: number;
          start: string;
          end: string;
          text: string;
          words: CaptionWord[];
        } = { id: 1, start: "", end: "", text: "", words: [] };
        
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          
          if (currentCaption.words.length === 0) {
            currentCaption.start = formatTime(word.start);
          }
          
          currentCaption.words.push(word);
          
          // Every ~7 words or on punctuation, create a new caption
          if (currentCaption.words.length >= 7 || 
              (word.text.match(/[.!?]$/) && currentCaption.words.length > 3) || 
              i === words.length - 1) {
            
            // Set the end time to the last word's end time
            currentCaption.end = formatTime(word.end);
            currentCaption.text = currentCaption.words.map(w => w.text).join(' ');
            
            captions.push({
              id: currentCaption.id,
              start: currentCaption.start,
              end: currentCaption.end,
              text: currentCaption.text
            });
            
            currentCaption = { id: captions.length + 1, start: "", end: "", text: "", words: [] };
          }
        }
        
        // Generate SRT content
        const srtContent = formatToSRT(words);
        
        // Update our stored transcription
        const updatedTranscription = await dbStorage.updateTranscription(transcriptionId, {
          status: "completed",
          progress: 100,
          captions,
          srtContent,
          title: transcriptionResult.text?.substring(0, 40) + "..." || storedTranscription.title,
          duration: transcriptionResult.audio_duration || storedTranscription.duration
        });
        
        // Return complete transcription data
        return res.status(200).json({
          ...updatedTranscription,
          id: transcriptionId,
          status: "completed",
          progress: 100
        });
      }
      
      // Still processing
      const progress = calculateProgress(transcriptionResult.status, storedTranscription.progress);
      
      console.log(`Transcription ${transcriptionId} status: ${transcriptionResult.status}, progress: ${storedTranscription.progress} -> ${progress}`);
      
      // Update progress in our stored transcription
      await dbStorage.updateTranscription(transcriptionId, {
        progress
      });
      
      // Return current status
      res.status(200).json({
        id: transcriptionId,
        status: "processing",
        progress,
        sourceUrl: storedTranscription.sourceUrl,
        title: storedTranscription.title
      });
      
    } catch (error) {
      console.error('Error checking transcription status:', error);
      res.status(500).json({ 
        message: "An error occurred while checking transcription status",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to format time in seconds to display
function formatTime(seconds: number): string {
  // Format in proper SRT format: HH:MM:SS,mmm
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

// Helper function to calculate progress percentage
function calculateProgress(status: string, previousProgress: number = 0): number {
  switch (status) {
    case "queued": 
      return Math.max(previousProgress, 20);
    case "processing":
      // More granular progress increments for better visual feedback
      if (previousProgress < 20) return 20;
      if (previousProgress < 35) return previousProgress + 3;
      if (previousProgress < 55) return previousProgress + 2;
      if (previousProgress < 75) return previousProgress + 3;
      if (previousProgress < 95) return previousProgress + 1;
      return 95; // Reserve 100% for completed
    case "completed":
      return 100;
    default:
      // For unknown states, start at 10%
      return Math.max(previousProgress, 10);
  }
}