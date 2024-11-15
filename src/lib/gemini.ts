import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiAI: GoogleGenerativeAI | null = null;

export const initializeGemini = (apiKey: string): boolean => {
  try {
    // Basic API key format validation
    if (!apiKey || apiKey.length < 20) {
      throw new Error('Invalid API key format');
    }
    
    geminiAI = new GoogleGenerativeAI(apiKey);
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
    return false;
  }
};

export const isGeminiInitialized = (): boolean => {
  return geminiAI !== null;
};

export const generatePromoContent = async (songName: string, description: string) => {
  if (!geminiAI) throw new Error('Gemini AI not initialized');

  const model = geminiAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Generate a social media promotional post for a song with the following details:
Song Name: ${songName}
Description: ${description}

Please provide a promotional post with the following structure (include emojis and keep the exact format):

1. Hook - A catchy text intro (1-2 emotional sentences with emojis)
2. Video Story - A detailed TikTok/Reel story concept (with emojis and text overlay instructions)
3. Caption - An engaging caption with emojis (2-3 sentences with call to action)
4. Hashtags - 8-10 trending and relevant hashtags (include music-specific and emotional tags)

Return ONLY a JSON object in this exact format (no additional text):
{
  "hook": "Your emotional hook with emojis",
  "videoStory": "Your detailed video concept with emojis and instructions",
  "caption": "Your engaging caption with emojis and call to action",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsed = cleanAndParseJSON(text);

    // Validate the response structure
    if (!parsed.hook || !parsed.videoStory || !parsed.caption || !Array.isArray(parsed.hashtags)) {
      throw new Error('Invalid response structure');
    }

    return parsed;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate content: ${error.message}`);
    }
    throw new Error('Failed to generate content');
  }
};

const cleanAndParseJSON = (text: string) => {
  // First clean the text content
  const cleanedText = text.replace(/\*\*/g, ''); // Remove double asterisks
  
  // Find the JSON object in the cleaned text
  const jsonRegex = /\{[\s\S]*\}/;
  const match = cleanedText.match(jsonRegex);
  
  if (!match) {
    throw new Error('No JSON found in response');
  }

  let jsonStr = match[0];
  
  // Clean up JSON formatting issues
  jsonStr = jsonStr
    .replace(/[\n\r]/g, ' ') // Remove newlines
    .replace(/,\s*}/g, '}') // Remove trailing commas
    .replace(/,\s*,/g, ',') // Remove double commas
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Ensure property names are quoted
    .trim();

  try {
    const parsed = JSON.parse(jsonStr);
    
    // Clean asterisks from all string values in the parsed object
    Object.keys(parsed).forEach(key => {
      if (typeof parsed[key] === 'string') {
        parsed[key] = parsed[key].replace(/\*\*/g, '');
      }
    });
    
    return parsed;
  } catch (error) {
    console.error('JSON parsing error:', jsonStr);
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
};