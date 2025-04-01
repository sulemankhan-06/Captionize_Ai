import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { urlSchema } from "../shared/schema";
import { downloadAudioFromUrl } from "./services/rapidApi";
import { transcribeAudio, getTranscriptionStatus } from "./services/assemblyAi";
import { formatToSRT } from "./utils/srtFormatter";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";

// Ensure temporary directory exists for audio files
const TEMP_DIR = path.join(tmpdir(), 'captionize-ai');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
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
      const newTranscription = await storage.createTranscription({
        sourceUrl: url,
        title: "Processing..."
      });
      
      // Generate a unique temporary file path for the audio
      const tempAudioPath = path.join(TEMP_DIR, `${uuidv4()}.mp3`);
      
      // First step: Download audio from the video URL
      console.log(`Downloading audio to ${tempAudioPath}`);
      const metadata = await downloadAudioFromUrl(url, tempAudioPath);
      
      if (!metadata || !fs.existsSync(tempAudioPath)) {
        // Update transcription status to failed
        await storage.updateTranscription(newTranscription.id, {
          status: "failed",
          error: "Failed to extract audio from the provided URL"
        });
        
        return res.status(400).json({ 
          message: "Failed to extract audio from the provided URL" 
        });
      }
      
      // Update transcription with metadata
      await storage.updateTranscription(newTranscription.id, {
        title: metadata.title || "Video Transcription",
        duration: metadata.duration,
        progress: 33 // Indicate progress after audio extraction
      });
      
      // Second step: Send audio to AssemblyAI for transcription
      console.log(`Sending audio to AssemblyAI for transcription`);
      const transcriptionId = await transcribeAudio(tempAudioPath);
      
      // Update transcription with AssemblyAI ID and progress
      await storage.updateTranscription(newTranscription.id, {
        metadata: { assemblyAiId: transcriptionId },
        progress: 66 // Indicate progress after submission to AssemblyAI
      });
      
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
      fs.unlinkSync(tempAudioPath);
      
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
      const storedTranscription = await storage.getTranscription(transcriptionId);
      
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
      
      if (!transcriptionResult) {
        await storage.updateTranscription(transcriptionId, {
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
        await storage.updateTranscription(transcriptionId, {
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
        const captions: Array<{id: number, start: string, text: string}> = [];
        
        interface CaptionWord {
          text: string;
          start: number;
          end: number;
          confidence: number;
        }
        
        let currentCaption: {
          id: number;
          start: string;
          text: string;
          words: CaptionWord[];
        } = { id: 1, start: "", text: "", words: [] };
        
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
            
            currentCaption.text = currentCaption.words.map(w => w.text).join(' ');
            captions.push({
              id: currentCaption.id,
              start: currentCaption.start,
              text: currentCaption.text
            });
            
            currentCaption = { id: captions.length + 1, start: "", text: "", words: [] };
          }
        }
        
        // Generate SRT content
        const srtContent = formatToSRT(words);
        
        // Update our stored transcription
        const updatedTranscription = await storage.updateTranscription(transcriptionId, {
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
      const progress = calculateProgress(transcriptionResult.status);
      
      // Update progress in our stored transcription
      await storage.updateTranscription(transcriptionId, {
        progress: Math.max(storedTranscription.progress, progress)
      });
      
      // Return current status
      res.status(200).json({
        id: transcriptionId,
        status: "processing",
        progress: Math.max(storedTranscription.progress, progress),
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

// Helper function to format time for display
function formatTime(seconds: number): string {
  const date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substring(11, 19);
}

// Helper function to calculate progress percentage
function calculateProgress(status: string): number {
  switch (status) {
    case "queued":
      return 10;
    case "processing":
      return 50;
    case "completed":
      return 100;
    default:
      return 25;
  }
}
