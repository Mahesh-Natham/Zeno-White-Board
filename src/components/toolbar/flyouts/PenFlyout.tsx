import { Pen, Eraser, Edit3, Wand2, SquareDashed, ArrowUpRight, Spline } from 'lucide-react';
import { TOOLS } from '../../../config/constants';
import ColorFlyout from './ColorFlyout';

const PEN_TOOLS = [
  { id: TOOLS.PEN, icon: Pen, label: 'Pen' },
  { id: TOOLS.MARKER, icon: Edit3, label: 'Marker' },
  { id: TOOLS.SMART_DRAWING, icon: Wand2, label: 'Smart Line/Curve' },
  { id: TOOLS.SMART_ARROW, icon: ArrowUpRight, label: 'Smart Arrow' },
  { id: TOOLS.SMART_CONNECTOR, icon: Spline, label: 'Smart Connector' },
  { id: TOOLS.ERASER, icon: Eraser, label: 'Eraser' },
  { id: TOOLS.LASSO, icon: SquareDashed, label: 'Lasso' },
  { id: TOOLS.AREA_ERASER, icon: Eraser, label: 'Area eraser' },
];

export default function PenFlyout({ activeTool, onSelect, activeColor, onSelectColor, activeWidth, onSelectWidth }) {
  return (
    <div className="flex flex-row bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden">
      {/* Pen Tools Column */}
      <div className="w-48 py-2 border-r border-gray-100 flex flex-col text-sm text-gray-700">
        {PEN_TOOLS.map((item) => {
          const isActive = activeTool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              disabled={item.disabled}
              className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-md transition-colors
                ${isActive ? 'bg-indigo-50 text-brand' : 'hover:bg-gray-100'}
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Color Palette Column */}
      <div className="w-48 py-3 pr-3 flex flex-col gap-3">
        <ColorFlyout 
          activeColor={activeColor} 
          onSelectColor={onSelectColor}
          hideExtraButtons={true} 
        />
        
        {/* Thickness Selection Slider */}
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-3 mt-1 px-1">
          <div className="flex justify-between items-center text-xs text-gray-600 font-medium">
            <span>Thickness</span>
            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">{activeWidth}px</span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="1" 
              max="40" 
              value={activeWidth} 
              onChange={(e) => onSelectWidth(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
