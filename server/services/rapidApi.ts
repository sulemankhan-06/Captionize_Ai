import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

const RAPID_API_KEY = process.env.RAPID_API_KEY || "ade14f5d8dmshb4ebb0bb57332e8p1b9b0cjsn760076d2f7f8";
const RAPID_API_HOST = 'social-download-all-in-one.p.rapidapi.com';

interface VideoMetadata {
  title?: string;
  duration?: number;
  author?: string;
}

/**
 * Download audio from a video URL using RapidAPI's service
 */
export async function downloadAudioFromUrl(url: string, outputPath: string): Promise<VideoMetadata | null> {
  try {
    // Step 1: Get video information and download links
    const response = await fetch('https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink', {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPID_API_KEY,
        'x-rapidapi-host': RAPID_API_HOST,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`RapidAPI responded with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.links || !Array.isArray(data.links)) {
      throw new Error('Invalid response from RapidAPI');
    }

    // Find the best audio download link
    // Prefer mp3 format if available, otherwise take the first audio link
    const audioLinks = data.links.filter((link: any) => 
      link.type?.toLowerCase().includes('audio') || 
      link.mime_type?.toLowerCase().includes('audio') ||
      link.extension?.toLowerCase() === 'mp3'
    );

    if (audioLinks.length === 0) {
      throw new Error('No audio links found in the response');
    }

    // Sort by quality and prefer mp3
    const bestAudioLink = audioLinks.sort((a: any, b: any) => {
      // Prefer MP3
      if (a.extension === 'mp3' && b.extension !== 'mp3') return -1;
      if (a.extension !== 'mp3' && b.extension === 'mp3') return 1;
      
      // Then prefer higher quality/bitrate if available
      if (a.quality && b.quality) {
        return parseInt(b.quality) - parseInt(a.quality);
      }
      
      return 0;
    })[0];

    // Step 2: Download the audio file
    const audioResponse = await fetch(bestAudioLink.url);
    
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio file: ${audioResponse.statusText}`);
    }

    if (!audioResponse.body) {
      throw new Error('Response body is null');
    }

    // Create parent directory if it doesn't exist
    const parentDir = path.dirname(outputPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // Save the file
    const fileStream = fs.createWriteStream(outputPath);
    await pipeline(audioResponse.body, fileStream);

    // Return metadata
    return {
      title: data.title,
      duration: data.duration,
      author: data.author
    };

  } catch (error) {
    console.error('Error downloading audio from URL:', error);
    // If any error occurs, make sure we're not leaving partial downloads
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    throw error;
  }
}
