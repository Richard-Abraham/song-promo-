import React from 'react';
import { Music4, Video, MessageCircle, Hash } from 'lucide-react';

interface PromoContent {
  hook: string;
  videoStory: string;
  caption: string;
  hashtags: string[];
}

interface PromoDisplayProps {
  content: PromoContent;
  optionNumber: number;
}

export default function PromoDisplay({ content, optionNumber }: PromoDisplayProps) {
  return (
    <div className="w-full glass rounded-xl shadow-2xl p-8 space-y-6 hover-scale">
      <div className="text-center mb-4">
        <span className="inline-block px-4 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
          Option {optionNumber}
        </span>
      </div>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <Music4 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Hook</h3>
            <p className="text-gray-700 font-medium">{content.hook}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="mt-1">
            <Video className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Video Story</h3>
            <p className="text-gray-700 font-medium">{content.videoStory}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="mt-1">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Caption</h3>
            <p className="text-gray-700 font-medium">{content.caption}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="mt-1">
            <Hash className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Hashtags</h3>
            <div className="flex flex-wrap gap-2">
              {content.hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}