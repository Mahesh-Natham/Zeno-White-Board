import { Sparkles, Layers } from 'lucide-react';

const COLORS = [
  '#fef08a', '#fde047', // Yellows
  '#fdba74', '#fca5a5', // Orange / Red
  '#fbcfe8', '#f472b6', // Pinks
  '#bfdbfe', '#a78bfa', // Blues / Purples
  '#a5f3fc', '#93c5fd', // Cyans / Sky
  '#6ee7b7', '#4ade80', // Teals / Greens
  '#d9f99d', '#a3e635', // Limes
  '#ffffff', '#171717', // White / Black
];

export default function ColorFlyout({ activeColor, onSelectColor, hideExtraButtons = false }) {
  return (
    <div className="w-40 p-2 bg-white rounded-md shadow-lg border border-gray-100 flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-1.5">
        {COLORS.map((color, idx) => (
          <button
            key={idx}
            className={`w-full aspect-square rounded-sm border border-black/10 transition-transform hover:scale-110
              ${activeColor === color ? 'ring-2 ring-brand ring-offset-1' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onSelectColor && onSelectColor(color)}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-100">
        <label className="text-xs text-gray-600 font-medium cursor-pointer" htmlFor="custom-color-picker">
          Custom Color
        </label>
        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200 cursor-pointer">
          <input 
            id="custom-color-picker"
            type="color" 
            value={activeColor && activeColor.startsWith('#') && activeColor.length === 7 ? activeColor : '#000000'}
            onChange={(e) => onSelectColor && onSelectColor(e.target.value)}
            className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer"
          />
        </div>
      </div>
      
      {!hideExtraButtons && (
        <div className="flex gap-1.5">
          <button className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 bg-gray-50 hover:bg-gray-100 rounded text-xs font-medium transition-colors text-gray-700">
            <Sparkles size={14} />
            Generate
          </button>

          <button className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 bg-gray-50 hover:bg-gray-100 rounded text-xs font-medium transition-colors text-gray-700">
            <Layers size={14} />
            Stack
          </button>
        </div>
      )}
    </div>
  );
}
