import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const RAPID_API_KEY = process.env.RAPID_API_KEY || "ade14f5d8dmshb4ebb0bb57332e8p1b9b0cjsn760076d2f7f8";
const RAPID_API_HOST = 'social-download-all-in-one.p.rapidapi.com';

// Promisify exec for async/await
const execAsync = promisify(exec);

/**
 * Extract audio from a video using ffmpeg
 * @param videoUrl URL of the video (must be a direct media URL, not a YouTube page URL)
 * @param outputPath Path where the audio file will be saved
 */
async function extractAudioWithFfmpeg(videoUrl: string, outputPath: string): Promise<void> {
  console.log(`Extracting audio with ffmpeg from: ${videoUrl}`);
  
  // Create parent directory if it doesn't exist
  const parentDir = path.dirname(outputPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
  
  // Validate that we're not trying to use ffmpeg on a YouTube page URL
  if (videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be/')) {
    throw new Error('Cannot use ffmpeg directly on YouTube page URLs. A direct media URL is required.');
  }
  
  // Use ffmpeg to extract audio from the direct media URL
  const command = `ffmpeg -y -i "${videoUrl}" -vn -acodec libmp3lame -ab 128k "${outputPath}"`;
  
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.log('ffmpeg stderr:', stderr);
    }
    console.log(`Audio successfully extracted to ${outputPath}`);
    return;
  } catch (error) {
    console.error('Error executing ffmpeg:', error);
    throw new Error(`Failed to extract audio with ffmpeg: ${error}`);
  }
}

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
    
    console.log('API Response:', JSON.stringify(apiResponse).substring(0, 500) + '...');
    
    // Handle different response structures
    let audioLinks = [];
    
    // Define common audio format IDs and extensions to look for
    const audioFormatIds = ['140', '141', '171', '249', '250', '251', 'm4a', 'mp3', 'weba'];
    const audioExtensions = ['mp3', 'm4a', 'aac', 'ogg', 'weba', 'opus', 'wav'];
    
    // For debugging - log the API response structure
    console.log('API Response keys:', Object.keys(apiResponse));
    if (apiResponse.medias) {
      console.log('Media items count:', apiResponse.medias.length);
      if (apiResponse.medias.length > 0) {
        console.log('First media item keys:', Object.keys(apiResponse.medias[0]));
      }
    }
    
    // Check for YouTube-specific medias array first (most reliable for YouTube)
    if (apiResponse && apiResponse.medias && Array.isArray(apiResponse.medias)) {
      // Try to find audio-only formats in medias array
      const audioFormats = apiResponse.medias.filter((media: any) => {
        if (!media || !media.url) return false;
        
        // Check if it's explicitly marked as audio
        const isAudioType = media.mimeType?.toLowerCase().includes('audio') || 
                          media.type?.toLowerCase() === 'audio';
        
        // Check common audio format IDs
        const hasAudioFormatId = media.formatId && 
          audioFormatIds.some(id => media.formatId.toString() === id);
        
        // Check common audio extensions
        const hasAudioExtension = media.ext && 
          audioExtensions.includes(media.ext.toLowerCase());
          
        return isAudioType || hasAudioFormatId || hasAudioExtension;
      });
      
      if (audioFormats.length > 0) {
        console.log(`Found ${audioFormats.length} audio formats in medias array`);
        audioLinks = audioFormats;
      }
    }
    
    // If no audio links found yet, check for typical links array structure
    if (audioLinks.length === 0 && apiResponse && apiResponse.links && Array.isArray(apiResponse.links)) {
      const audioFormats = apiResponse.links.filter((link: any) => {
        if (!link || !link.url) return false;
        
        // Check various fields that might indicate audio content
        return (link.type?.toLowerCase().includes('audio') || 
               link.mime_type?.toLowerCase().includes('audio') ||
               (link.extension && audioExtensions.includes(link.extension.toLowerCase())) ||
               (link.label && link.label.toLowerCase().includes('audio')));
      });
      
      if (audioFormats.length > 0) {
        console.log(`Found ${audioFormats.length} audio formats in links array`);
        audioLinks = audioFormats;
      }
    } 
    
    // Alternative structure with results property
    if (audioLinks.length === 0 && apiResponse && apiResponse.result && typeof apiResponse.result === 'object') {
      // Some responses might have a formats array within result
      if (apiResponse.result.formats && Array.isArray(apiResponse.result.formats)) {
        const audioFormats = apiResponse.result.formats.filter((format: any) => {
          if (!format || !format.url) return false;
          
          return (format.mimeType?.toLowerCase().includes('audio') || 
                (format.extension && audioExtensions.includes(format.extension.toLowerCase())) ||
                (format.formatId && audioFormatIds.includes(format.formatId.toString())));
        });
        
        if (audioFormats.length > 0) {
          console.log(`Found ${audioFormats.length} audio formats in result.formats array`);
          audioLinks = audioFormats;
        }
      } 
      // Some responses might have a media array
      else if (apiResponse.result.media && Array.isArray(apiResponse.result.media)) {
        const audioFormats = apiResponse.result.media.filter((media: any) => {
          if (!media || !media.url) return false;
          
          return media.format?.toLowerCase().includes('audio') || 
                 (media.extension && audioExtensions.includes(media.extension.toLowerCase()));
        });
        
        if (audioFormats.length > 0) {
          console.log(`Found ${audioFormats.length} audio formats in result.media array`);
          audioLinks = audioFormats;
        }
      }
      // Some responses might have adaptiveFormats array
      else if (apiResponse.result.adaptiveFormats && Array.isArray(apiResponse.result.adaptiveFormats)) {
        const audioFormats = apiResponse.result.adaptiveFormats.filter((format: any) => {
          if (!format || !format.url) return false;
          
          return format.type?.toLowerCase().includes('audio') || 
                 (format.format && audioFormatIds.some(id => format.format.includes(id)));
        });
        
        if (audioFormats.length > 0) {
          console.log(`Found ${audioFormats.length} audio formats in adaptiveFormats array`);
          audioLinks = audioFormats;
        }
      }
    }
    
    console.log(`Found ${audioLinks.length} audio links in response`);
    
    if (audioLinks.length === 0) {
      console.log('No specific audio links found, searching for any downloadable URL');
      
      // Try different structures to find any URL
      let anyDownloadLinks: any[] = [];
      
      if (apiResponse && apiResponse.links && Array.isArray(apiResponse.links)) {
        anyDownloadLinks = apiResponse.links.filter((link: any) => link.url && typeof link.url === 'string');
      } else if (apiResponse && apiResponse.result) {
        if (Array.isArray(apiResponse.result)) {
          anyDownloadLinks = apiResponse.result.filter((item: any) => item && item.url && typeof item.url === 'string');
        } else if (apiResponse.result.formats && Array.isArray(apiResponse.result.formats)) {
          anyDownloadLinks = apiResponse.result.formats.filter((format: any) => format && format.url && typeof format.url === 'string');
        } else if (apiResponse.result.url && typeof apiResponse.result.url === 'string') {
          anyDownloadLinks = [apiResponse.result];
        }
      } else if (Array.isArray(apiResponse)) {
        anyDownloadLinks = apiResponse.filter((item: any) => item && item.url && typeof item.url === 'string');
      } else if (apiResponse && apiResponse.url && typeof apiResponse.url === 'string') {
        anyDownloadLinks = [apiResponse];
      }
      
      if (anyDownloadLinks.length > 0) {
        console.log('Found general download links, using the first available one');
        audioLinks.push(anyDownloadLinks[0]);
      } else {
        console.error('Complete API response:', JSON.stringify(apiResponse));
        throw new Error('No download links found in the response');
      }
    }

    // Sort by quality and prefer mp3
    audioLinks.sort((a: any, b: any) => {
      // Prefer MP3
      if (a.extension === 'mp3' && b.extension !== 'mp3') return -1;
      if (a.extension !== 'mp3' && b.extension === 'mp3') return 1;
      
      // Then prefer higher quality/bitrate if available
      if (a.quality && b.quality) {
        return parseInt(b.quality) - parseInt(a.quality);
      }
      
      return 0;
    });
    
    // Get the best audio link (can be modified later)
    let bestAudioLink = audioLinks.length > 0 ? audioLinks[0] : null;
    
    // If we didn't find a proper audio link but got a YouTube URL, try extracting directly
    if ((!bestAudioLink || !bestAudioLink.url) && apiResponse.url && apiResponse.url.includes('youtube.com')) {
      console.log("Using direct YouTube URL extraction fallback");
      
      try {
        // Get audio-only formats from the medias array if available
        if (apiResponse.medias && Array.isArray(apiResponse.medias)) {
          const audioItems = apiResponse.medias.filter((media: any) => 
            media.mimeType && media.mimeType.toLowerCase().includes('audio') &&
            media.url && typeof media.url === 'string'
          );
          
          if (audioItems.length > 0) {
            // Sort by quality
            audioItems.sort((a: any, b: any) => 
              (b.bitrate || 0) - (a.bitrate || 0)
            );
            
            const bestAudio = audioItems[0];
            
            if (bestAudio && bestAudio.url) {
              console.log("Found direct audio URL in medias array");
              audioLinks.push(bestAudio);
              bestAudioLink = bestAudio;
            }
          }
        }
      } catch (error) {
        console.error("Error in YouTube fallback extraction:", error);
      }
    }

    // Check if we have usable audio link from the API
    if (bestAudioLink && bestAudioLink.url) {
      console.log(`Selected download URL: ${bestAudioLink.url.substring(0, 50)}...`);

      try {
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
      } catch (error) {
        console.error('Error downloading audio with fetch:', error);
        
        // For YouTube URLs, we can't use ffmpeg directly on the YouTube page URL
        // Since the direct download failed, we have to report the error
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          console.error('Failed to download audio from YouTube URL and cannot use ffmpeg directly on YouTube URLs');
          throw new Error('Failed to extract audio from YouTube URL: ' + (error instanceof Error ? error.message : String(error)));
        } else if (bestAudioLink && bestAudioLink.url) {
          // For non-YouTube URLs with a direct media URL, try ffmpeg as fallback
          console.log('Attempting ffmpeg extraction as fallback with the media URL...');
          await extractAudioWithFfmpeg(bestAudioLink.url, outputPath);
        } else {
          throw error; // Re-throw if we don't have a URL to work with
        }
      }
    } else {
      // No usable audio link found, we can't proceed
      console.error('No usable audio links found in API response');
      throw new Error('Could not find any audio download links in the API response');
    }

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
