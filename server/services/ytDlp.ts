import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface VideoMetadata {
  title?: string;
  duration?: number;
  author?: string;
  filePath: string;
}

/**
 * Download video from URL using yt-dlp
 * @param url The URL of the video to download
 * @returns Promise with video metadata including file path
 */
export async function downloadVideoFromUrl(url: string): Promise<VideoMetadata> {
  try {
    // Generate a unique ID for the file
    const fileId = uuidv4();
    const outputTemplate = path.join(UPLOADS_DIR, `${fileId}.%(ext)s`);
    
    console.log(`Downloading video from ${url} using yt-dlp...`);
    
    // Execute yt-dlp command with best audio quality
    // -S +size,+br,+res,+fps sorts by size, bitrate, resolution, and fps
    // -x extracts audio only
    // --audio-format mp3 converts to mp3 format
    // Using the latest yt-dlp executable we downloaded
    const ytDlpPath = 'yt-dlp';
    
    // Execute yt-dlp with additional options to help with YouTube restrictions
    // --force-ipv4 to avoid some IPv6 issues
    // --geo-bypass to bypass geo-restrictions
    // --no-check-certificate to bypass SSL verification issues
    // --extractor-retries 3 to retry extracting information up to 3 times
    // --ignore-errors to continue even if there are non-fatal errors
    // Old command (w/ postprocess conversion to audio):
    // `${ytDlpPath} -S +size,+br,+res,+fps -x --audio-format mp3 --force-ipv4 --geo-bypass --no-check-certificate --extractor-retries 3 --ignore-errors -o "${outputTemplate}" "${url}"`
    const { stdout } = await execAsync(
      `${ytDlpPath} -S +size,+br,+res,+fps -x --audio-format mp3 --force-ipv4 --geo-bypass --no-check-certificate --extractor-retries 3 --ignore-errors -o "${outputTemplate}" "${url}"`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer for large outputs
    );
    
    console.log(`yt-dlp output: ${stdout}`);
    
    // Find the created file (the extension will be added by yt-dlp)
    const files = fs.readdirSync(UPLOADS_DIR);
    const downloadedFile = files.find(file => file.startsWith(fileId));
    
    if (!downloadedFile) {
      throw new Error('Failed to find downloaded file');
    }
    
    const filePath = path.join(UPLOADS_DIR, downloadedFile);
    console.log(`Downloaded file: ${filePath}`);
    
    // Extract metadata using yt-dlp
    const { stdout: metadataOutput } = await execAsync(
      `${ytDlpPath} --print title --print duration --print channel --force-ipv4 --geo-bypass --no-check-certificate --extractor-retries 3 --ignore-errors "${url}"`,
      { maxBuffer: 1024 * 1024 } // 1MB buffer
    );
    
    // Parse metadata (output format is title, duration, channel each on new line)
    const [title, durationStr, author] = metadataOutput.trim().split('\n');
    const duration = parseFloat(durationStr);
    
    return {
      title,
      duration: isNaN(duration) ? undefined : duration,
      author,
      filePath
    };
  } catch (error: any) {
    console.error('Error downloading video with yt-dlp:', error);
    
    // Add more descriptive error message based on yt-dlp errors
    if (error.stderr && typeof error.stderr === 'string') {
      if (error.stderr.includes('HTTP Error 403: Forbidden')) {
        throw new Error('Access to this video is forbidden. It may be private or region-restricted.');
      } else if (error.stderr.includes('This video is unavailable')) {
        throw new Error('This video is unavailable. It may have been removed or made private.');
      } else if (error.stderr.includes('Sign in to confirm your age')) {
        throw new Error('This video requires age verification and cannot be accessed.');
      } else if (error.stderr.includes('ERROR: unable to download')) {
        throw new Error('Unable to download the video due to access restrictions or network issues.');
      }
    }
    
    // Fallback to original error
    throw error;
  }
}

/**
 * Clean up downloaded files
 * @param filePath Path to the file to clean up
 */
export function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up file ${filePath}:`, error);
  }
}