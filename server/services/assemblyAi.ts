import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';
import { TranscriptionResult } from '@shared/schema';

const ASSEMBLY_AI_API_KEY = process.env.ASSEMBLY_AI_API_KEY;
const ASSEMBLY_AI_API_URL = 'https://api.assemblyai.com/v2';

// Create headers with authorization
const getAuthHeaders = (contentType?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'authorization': ASSEMBLY_AI_API_KEY || ''
  };
  
  if (contentType) {
    headers['content-type'] = contentType;
  }
  
  return headers;
};

/**
 * Upload an audio file to AssemblyAI
 */
async function uploadAudioFile(filePath: string): Promise<string> {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    const response = await fetch(`${ASSEMBLY_AI_API_URL}/upload`, {
      method: 'POST',
      headers: getAuthHeaders('application/octet-stream'),
      body: fileContent
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload audio file: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.upload_url;
  } catch (error) {
    console.error('Error uploading audio file to AssemblyAI:', error);
    throw error;
  }
}

/**
 * Submit an audio file for transcription
 */
export async function transcribeAudio(filePath: string): Promise<string> {
  try {
    // First, upload the audio file
    const uploadUrl = await uploadAudioFile(filePath);
    
    // Then, submit the transcription request
    const response = await fetch(`${ASSEMBLY_AI_API_URL}/transcript`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify({
        audio_url: uploadUrl,
        word_boost: ["AI", "caption", "transcription", "neural network"],
        punctuate: true,
        format_text: true,
        dual_channel: false,
        language_detection: true,
        sentiment_analysis: false,
        auto_highlights: true,
        word_timestamps: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit transcription request: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error submitting transcription request to AssemblyAI:', error);
    throw error;
  }
}

/**
 * Check the status of a transcription request
 */
export async function getTranscriptionStatus(transcriptionId: string): Promise<TranscriptionResult | null> {
  try {
    const response = await fetch(`${ASSEMBLY_AI_API_URL}/transcript/${transcriptionId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to get transcription status: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking transcription status:', error);
    throw error;
  }
}
