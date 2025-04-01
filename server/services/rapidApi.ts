import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import https from 'https';

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
    console.log(`Processing URL: ${url} to extract audio`);
    
    // Step 1: Get video information and download links using the API
    const options = {
      method: 'POST',
      hostname: 'social-download-all-in-one.p.rapidapi.com',
      path: '/v1/social/autolink',
      headers: {
        'x-rapidapi-key': RAPID_API_KEY,
        'x-rapidapi-host': RAPID_API_HOST,
        'Content-Type': 'application/json'
      }
    };

    // Using promise to handle the API request
    const apiResponse = await new Promise<any>((resolve, reject) => {
      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];
        
        res.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        res.on('end', () => {
          const body = Buffer.concat(chunks);
          try {
            const data = JSON.parse(body.toString());
            resolve(data);
          } catch (error) {
            reject(new Error(`Failed to parse RapidAPI response: ${error}`));
          }
        });
        
        res.on('error', (error) => {
          reject(error);
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(JSON.stringify({ url }));
      req.end();
    });
    
    console.log('Response received from RapidAPI');
    
    // Check if response has expected structure
    if (!apiResponse || !apiResponse.links || !Array.isArray(apiResponse.links)) {
      console.error('Unexpected response structure:', JSON.stringify(apiResponse));
      throw new Error('Invalid response structure from RapidAPI');
    }
    
    // Find suitable audio links
    const audioLinks = apiResponse.links.filter((link: any) => 
      (link.type?.toLowerCase().includes('audio') || 
      link.mime_type?.toLowerCase().includes('audio') ||
      link.extension?.toLowerCase() === 'mp3') &&
      link.url // Ensure URL exists
    );
    
    console.log(`Found ${audioLinks.length} audio links in response`);
    
    if (audioLinks.length === 0) {
      // If no audio links found, try to use any link with a downloadable URL
      const anyDownloadLinks = apiResponse.links.filter((link: any) => link.url && typeof link.url === 'string');
      
      if (anyDownloadLinks.length > 0) {
        console.log('No audio links found, using first available download link');
        audioLinks.push(anyDownloadLinks[0]);
      } else {
        throw new Error('No download links found in the response');
      }
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

    console.log(`Selected download URL: ${bestAudioLink.url.substring(0, 50)}...`);

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

    console.log(`Audio file saved to ${outputPath}`);

    // Return metadata
    return {
      title: apiResponse.title || "Video Transcription",
      duration: apiResponse.duration,
      author: apiResponse.author
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
