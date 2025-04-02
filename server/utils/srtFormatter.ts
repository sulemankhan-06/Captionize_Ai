interface Word {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

/**
 * Convert seconds to SRT timestamp format (HH:MM:SS,mmm)
 * Note: SRT format uses comma as decimal separator
 * For short videos, always use 00 for hours to maintain standard format
 */
function formatSrtTimestamp(seconds: number): string {
  // For short clips, we'll always use 00 for hours
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `00:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

/**
 * Format transcription words into SRT format
 */
export function formatToSRT(words: Word[]): string {
  // If no words, return empty string
  if (!words || words.length === 0) {
    return '';
  }
  
  const captions: {
    index: number;
    start: number;
    end: number;
    text: string;
  }[] = [];
  
  let captionIndex = 1;
  let currentCaption = {
    index: captionIndex,
    start: words[0].start,
    end: 0,
    text: '',
    words: [] as Word[]
  };
  
  // Group words into captions (aiming for ~7 words per caption)
  words.forEach((word, i) => {
    currentCaption.words.push(word);
    
    // Every ~7 words or on punctuation, create a new caption
    if (currentCaption.words.length >= 7 || 
        (word.text.match(/[.!?]$/) && currentCaption.words.length > 3) || 
        i === words.length - 1) {
      
      currentCaption.end = word.end;
      currentCaption.text = currentCaption.words.map(w => w.text).join(' ');
      
      captions.push({
        index: currentCaption.index,
        start: currentCaption.start,
        end: currentCaption.end,
        text: currentCaption.text
      });
      
      captionIndex++;
      
      // Start new caption if not the last word
      if (i < words.length - 1) {
        currentCaption = {
          index: captionIndex,
          start: words[i + 1].start,
          end: 0,
          text: '',
          words: []
        };
      }
    }
  });
  
  // Format as SRT
  return captions
    .map(caption => {
      return `${caption.index}\n${formatSrtTimestamp(caption.start)} --> ${formatSrtTimestamp(caption.end)}\n${caption.text}\n`;
    })
    .join('\n');
}
