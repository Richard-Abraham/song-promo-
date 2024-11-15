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
    
    // Clean the response text
    const cleanedText = text
      .replace(/[\n\r]/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    // Try to extract JSON from the response
    const jsonMatch = cleanedText.match(/\{.*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const jsonStr = jsonMatch[0];
    
    try {
      const parsed = JSON.parse(jsonStr);

      // Validate the response structure
      if (!parsed.hook || !parsed.videoStory || !parsed.caption || !Array.isArray(parsed.hashtags)) {
        throw new Error('Invalid response structure');
      }

      return parsed;
    } catch (parseError: unknown) {
      throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate content: ${error.message}`);
    }
    throw new Error('Failed to generate content');
  }
};