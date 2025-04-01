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
      
      // First step: Download audio from the video URL
      const tempAudioPath = path.join(TEMP_DIR, `${uuidv4()}.mp3`);
      const metadata = await downloadAudioFromUrl(url, tempAudioPath);
      
      if (!metadata || !fs.existsSync(tempAudioPath)) {
        return res.status(400).json({ 
          message: "Failed to extract audio from the provided URL" 
        });
      }
      
      // Second step: Send audio to AssemblyAI for transcription
      const transcriptionId = await transcribeAudio(tempAudioPath);
      
      // Create a new transcription record
      const newTranscription = await storage.createTranscription({
        sourceUrl: url,
        title: metadata.title || "Video Transcription"
      });
      
      // Return the transcription ID and initial status
      res.status(200).json({
        id: transcriptionId,
        status: "processing",
        sourceUrl: url,
        title: metadata.title || "Video Transcription"
      });
      
      // Clean up temporary file
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
      
      // Get transcription status from AssemblyAI
      const transcriptionResult = await getTranscriptionStatus(transcriptionId);
      
      if (!transcriptionResult) {
        return res.status(404).json({ message: "Transcription not found" });
      }
      
      if (transcriptionResult.status === "error") {
        return res.status(400).json({ 
          status: "failed",
          error: "Transcription failed: " + (transcriptionResult.error || "Unknown error")
        });
      }
      
      if (transcriptionResult.status === "completed") {
        // Format the transcription results to display and SRT format
        const words = transcriptionResult.words || [];
        
        // Group words into captions (roughly 5-10 words per caption)
        const captions = [];
        let currentCaption = { id: 1, start: "", text: "", words: [] };
        
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
        
        // Return complete transcription data
        return res.status(200).json({
          id: transcriptionId,
          status: "completed",
          progress: 100,
          captions,
          srtContent,
          sourceUrl: transcriptionResult.audio_url,
          title: transcriptionResult.text?.substring(0, 50) + "...",
          duration: transcriptionResult.audio_duration
        });
      }
      
      // Still processing
      const progress = calculateProgress(transcriptionResult.status);
      
      res.status(200).json({
        id: transcriptionId,
        status: "processing",
        progress
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
