import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Music2, Wand2 } from 'lucide-react';
import { initializeGemini, generatePromoContent, isGeminiInitialized } from './lib/gemini';
import PromoDisplay from './components/PromoDisplay';

interface PromoContent {
  hook: string;
  videoStory: string;
  caption: string;
  hashtags: string[];
}

function App() {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [songName, setSongName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [promoContents, setPromoContents] = useState<PromoContent[]>(() => {
    const saved = localStorage.getItem('promo_contents');
    return saved ? JSON.parse(saved) : [];
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(() => {
    return !localStorage.getItem('gemini_api_key');
  });

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    
    if (newApiKey.length >= 20) {
      try {
        const initialized = initializeGemini(newApiKey);
        if (initialized) {
          localStorage.setItem('gemini_api_key', newApiKey);
          toast.success('API key validated successfully');
        } else {
          toast.error('Failed to initialize API key');
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Invalid API key format');
        }
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isGeminiInitialized()) {
      try {
        const initialized = initializeGemini(apiKey);
        if (!initialized) {
          toast.error('Invalid API key');
          return;
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to initialize with provided API key');
        }
        return;
      }
    }
  
    if (!songName || !description) {
      toast.error('Please fill in all fields');
      return;
    }
  
    setIsGenerating(true);
    try {
      const content1 = await generatePromoContent(songName, description);
      const content2 = await generatePromoContent(songName, description);
      const newContents = [content1, content2];
      setPromoContents(newContents);
      localStorage.setItem('promo_contents', JSON.stringify(newContents));
      toast.success('Promo content generated successfully!');
    } catch (error) {
      if (error instanceof Error && error.message.includes('SAFETY')) {
        toast.error(
          'Content safety filter triggered. Try rephrasing your description to be more professional and music-focused.'
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to generate content. Please check your API key and try again.');
      }
      console.error(error);
    } finally {
      setIsGenerating(false);
    };

   
  };

  const handleClear = () => {
    setPromoContents([]);
    localStorage.removeItem('promo_contents');
    toast.success('Generated content cleared');
  };

  return (
    <div className="min-h-screen animated-gradient">
      <Toaster position="top-center" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <Music2 className="w-10 h-10 text-white" />
                <h1 className="title-text">
                  Song Promo Generator
                </h1>
              </div>
              <p className="subtitle-text">
                Transform your song into engaging social media content
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="space-y-6">
              <div className="mb-8">
                {showApiKeyInput ? (
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={handleApiKeyChange}
                      placeholder="Enter your Gemini API key"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {apiKey && (
                      <button
                        onClick={() => setShowApiKeyInput(false)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Save
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApiKeyInput(true)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Update API Key</span>
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="songName" className="block text-sm font-medium text-gray-700 mb-1">
                  Song Name
                </label>
                <input
                  type="text"
                  id="songName"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter the name of your song"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your song (genre, mood, themes, etc.)"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-purple-400 flex items-center justify-center gap-2"
              >
                <Wand2 className="w-5 h-5" />
                {isGenerating ? 'Generating...' : 'Generate Promo Content'}
              </button>
            </div>
          </form>

          {promoContents.length > 0 && (
            <div className="mt-8 space-y-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Generated Options</h2>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Results
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {promoContents.map((content, index) => (
                  <PromoDisplay key={index} content={content} optionNumber={index + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;