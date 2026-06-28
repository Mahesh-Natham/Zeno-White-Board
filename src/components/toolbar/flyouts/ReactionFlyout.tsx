import { useState } from 'react';

const STANDARD_EMOJIS = ['👍', '❤️', '🔥', '😂', '😮', '👏', '🎉', '💡'];

export default function ReactionFlyout({ onSelect }) {
  const [customEmoji, setCustomEmoji] = useState('');

  return (
    <div className="p-3 bg-white/90 backdrop-blur-md rounded-md shadow-floating border border-gray-100 w-64 pointer-events-auto">
      <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">Reactions</div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {STANDARD_EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="text-2xl hover:bg-gray-100 p-1 rounded-md transition-colors flex items-center justify-center cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={customEmoji}
          onChange={(e) => setCustomEmoji(e.target.value)}
          placeholder="Custom..."
          className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          maxLength={5}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customEmoji) onSelect(customEmoji);
          }}
        />
        <button
          onClick={() => {
            if (customEmoji) onSelect(customEmoji);
          }}
          className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
}
