interface Word {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

/**
 * Convert seconds to SRT timestamp format (HH:MM:SS,mmm)
 */
function formatSrtTimestamp(seconds: number): string {
  const date = new Date(0);
  date.setSeconds(seconds);
  
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const secs = String(date.getUTCSeconds()).padStart(2, '0');
  const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
  
  return `${hours}:${minutes}:${secs},${ms}`;
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
