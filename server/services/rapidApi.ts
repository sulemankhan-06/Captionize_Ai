import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import https from "https";

const RAPID_API_KEY =
  process.env.RAPID_API_KEY ||
  "ade14f5d8dmshb4ebb0bb57332e8p1b9b0cjsn760076d2f7f8";
const RAPID_API_HOST = "social-download-all-in-one.p.rapidapi.com";

interface VideoMetadata {
  title?: string;
  duration?: number;
  author?: string;
}

/**
 * Download audio from a video URL using RapidAPI's service
 */
export async function downloadAudioFromUrl(
  url: string,
  outputPath: string,
): Promise<VideoMetadata | null> {
  try {
    console.log(`Processing URL: ${url} to extract audio`);

    // Step 1: Get video information and download links using the API
    const options = {
      method: "POST",
      hostname: "social-download-all-in-one.p.rapidapi.com",
      path: "/v1/social/autolink",
      headers: {
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": RAPID_API_HOST,
        "Content-Type": "application/json",
      },
    };

    // Using promise to handle the API request
    const apiResponse = await new Promise<any>((resolve, reject) => {
      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];

        res.on("data", (chunk) => {
          chunks.push(chunk);
        });

        res.on("end", () => {
          const body = Buffer.concat(chunks);
          try {
            const data = JSON.parse(body.toString());
            resolve(data);
          } catch (error) {
            reject(new Error(`Failed to parse RapidAPI response: ${error}`));
          }
        });

        res.on("error", (error) => {
          reject(error);
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.write(JSON.stringify({ url }));
      req.end();
    });

    console.log("Response received from RapidAPI");

    console.log("API Response:", JSON.stringify(apiResponse));

    // Handle different response structures
    let audioLinks = [];

    // Check for typical links array structure
    if (apiResponse && apiResponse.links && Array.isArray(apiResponse.links)) {
      // Original structure with links array
      audioLinks = apiResponse.links.filter(
        (link: any) =>
          (link.type?.toLowerCase().includes("audio") ||
            link.mime_type?.toLowerCase().includes("audio") ||
            link.extension?.toLowerCase() === "mp3") &&
          link.url, // Ensure URL exists
      );
    }
    // Alternative structure with results property
    else if (
      apiResponse &&
      apiResponse.result &&
      typeof apiResponse.result === "object"
    ) {
      // Some responses might have a 'result' object with URLs
      if (Array.isArray(apiResponse.result)) {
        audioLinks = apiResponse.result.filter(
          (item: any) => item && item.url && typeof item.url === "string",
        );
      } else if (
        apiResponse.result.formats &&
        Array.isArray(apiResponse.result.formats)
      ) {
        // Structure might have formats array
        audioLinks = apiResponse.result.formats.filter(
          (format: any) =>
            (format.mimeType?.toLowerCase().includes("audio") ||
              format.extension?.toLowerCase() === "mp3" ||
              format.formatId?.toString().includes("251")) && // Common audio format ID
            format.url,
        );
      }
    }
    // Direct array response
    else if (Array.isArray(apiResponse)) {
      audioLinks = apiResponse.filter(
        (item: any) =>
          item &&
          item.url &&
          typeof item.url === "string" &&
          (item.mimeType?.toLowerCase().includes("audio") ||
            item.extension?.toLowerCase() === "mp3" ||
            item.formatId?.toString().includes("251")),
      );
    }

    console.log(`Found ${audioLinks.length} audio links in response`);

    if (audioLinks.length === 0) {
      console.log(
        "No specific audio links found, searching for any downloadable URL",
      );

      // Try different structures to find any URL
      let anyDownloadLinks: any[] = [];

      if (
        apiResponse &&
        apiResponse.links &&
        Array.isArray(apiResponse.links)
      ) {
        anyDownloadLinks = apiResponse.links.filter(
          (link: any) => link.url && typeof link.url === "string",
        );
      } else if (apiResponse && apiResponse.result) {
        if (Array.isArray(apiResponse.result)) {
          anyDownloadLinks = apiResponse.result.filter(
            (item: any) => item && item.url && typeof item.url === "string",
          );
        } else if (
          apiResponse.result.formats &&
          Array.isArray(apiResponse.result.formats)
        ) {
          anyDownloadLinks = apiResponse.result.formats.filter(
            (format: any) =>
              format && format.url && typeof format.url === "string",
          );
        } else if (
          apiResponse.result.url &&
          typeof apiResponse.result.url === "string"
        ) {
          anyDownloadLinks = [apiResponse.result];
        }
      } else if (Array.isArray(apiResponse)) {
        anyDownloadLinks = apiResponse.filter(
          (item: any) => item && item.url && typeof item.url === "string",
        );
      } else if (
        apiResponse &&
        apiResponse.url &&
        typeof apiResponse.url === "string"
      ) {
        anyDownloadLinks = [apiResponse];
      }

      if (anyDownloadLinks.length > 0) {
        console.log(
          "Found general download links, using the first available one",
        );
        audioLinks.push(anyDownloadLinks[0]);
      } else {
        console.error("Complete API response:", JSON.stringify(apiResponse));
        throw new Error("No download links found in the response");
      }
    }

    // Sort by quality and prefer mp3
    let bestAudioLink = audioLinks.sort((a: any, b: any) => {
      // Prefer MP3
      if (a.extension === "mp3" && b.extension !== "mp3") return -1;
      if (a.extension !== "mp3" && b.extension === "mp3") return 1;

      // Then prefer higher quality/bitrate if available
      if (a.quality && b.quality) {
        return parseInt(b.quality) - parseInt(a.quality);
      }

      return 0;
    })[0];

    // If we have YouTube-specific response format, try to extract the best audio format
    if (apiResponse.source && apiResponse.source === "youtube") {
      console.log("Processing YouTube-specific response format");

      try {
        // Check for medias array (common in YouTube responses)
        if (apiResponse.medias && Array.isArray(apiResponse.medias)) {
          console.log(
            `Found ${apiResponse.medias.length} media items in YouTube response`,
          );

          // First look for audio-only formats
          const audioOnlyItems = apiResponse.medias.filter(
            (media: any) =>
              ((media.type && media.type.toLowerCase().includes("audio")) ||
                (media.mimeType &&
                  media.mimeType.toLowerCase().includes("audio")) ||
                (media.formatId &&
                  ["139", "140", "141", "249", "250", "251"].includes(
                    media.formatId.toString(),
                  ))) &&
              media.url &&
              typeof media.url === "string",
          );

          // If we found audio-only formats, use the highest quality one
          if (audioOnlyItems.length > 0) {
            console.log(`Found ${audioOnlyItems.length} audio-only items`);

            // Sort by bitrate (higher = better quality)
            audioOnlyItems.sort(
              (a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0),
            );

            const bestAudio = audioOnlyItems[0];

            if (bestAudio && bestAudio.url) {
              console.log(
                `Selected audio format: ${bestAudio.formatId || "unknown"}, bitrate: ${bestAudio.bitrate || "unknown"}`,
              );

              // This is now our preferred audio link
              audioLinks = [bestAudio];
              bestAudioLink = bestAudio;
            }
          }
          // If no audio-only formats, try video formats with audio
          else if (
            apiResponse.medias.length > 0 &&
            (!bestAudioLink || !bestAudioLink.url)
          ) {
            console.log(
              "No audio-only formats found, looking for video formats with audio",
            );

            // Filter for formats that likely have audio (avoid formats known to be audio-less)
            const videoWithAudioItems = apiResponse.medias.filter(
              (media: any) =>
                media.url &&
                typeof media.url === "string" &&
                (!media.formatId ||
                  !["160", "133", "134", "135", "136"].includes(
                    media.formatId.toString(),
                  )),
            );

            if (videoWithAudioItems.length > 0) {
              // Prefer lower quality video to save bandwidth but still get audio
              // Sort by height (lower resolution = smaller file = faster download)
              videoWithAudioItems.sort(
                (a: any, b: any) => (a.height || 1080) - (b.height || 1080),
              );

              const smallestVideoWithAudio = videoWithAudioItems[0];

              if (smallestVideoWithAudio && smallestVideoWithAudio.url) {
                console.log(
                  `Selected video format with audio: ${smallestVideoWithAudio.formatId || "unknown"}, resolution: ${smallestVideoWithAudio.height || "unknown"}p`,
                );

                // This is now our preferred audio link
                audioLinks = [smallestVideoWithAudio];
                bestAudioLink = smallestVideoWithAudio;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error in YouTube format extraction:", error);
      }
    }

    console.log(
      `Selected download URL: ${bestAudioLink.url.substring(0, 50)}...`,
    );

    // Step 2: Download the audio file
    const audioResponse = await fetch(bestAudioLink.url);

    if (!audioResponse.ok) {
      throw new Error(
        `Failed to download audio file: ${audioResponse.statusText}`,
      );
    }

    if (!audioResponse.body) {
      throw new Error("Response body is null");
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
      author: apiResponse.author,
    };
  } catch (error) {
    console.error("Error downloading audio from URL:", error);
    // If any error occurs, make sure we're not leaving partial downloads
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    throw error;
  }
}
