import { 
  Minus, 
  ArrowRight, 
  CornerDownRight, 
  ArrowBigRight,
  Square, 
  Circle, 
  Triangle,
  Diamond,
  Grid
} from 'lucide-react';
import { TOOLS } from '../../../config/constants';

const SHAPE_ITEMS = [
  { id: TOOLS.LINE, icon: Minus, label: 'Line', shortcut: 'L' },
  { id: TOOLS.ARROW, icon: ArrowRight, label: 'Arrow' },
  { id: TOOLS.ELBOW_ARROW, icon: CornerDownRight, label: 'Elbow arrow' },
  { id: TOOLS.BLOCK_ARROW, icon: ArrowBigRight, label: 'Block arrow' },
  { divider: true },
  { id: TOOLS.RECTANGLE, icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: TOOLS.CIRCLE, icon: Circle, label: 'Oval', shortcut: 'O' },
  { id: TOOLS.RHOMBUS, icon: Diamond, label: 'Rhombus' },
  { id: TOOLS.TRIANGLE, icon: Triangle, label: 'Triangle' },
  { id: TOOLS.DIVIDER, icon: Minus, label: 'Divider' },
  { divider: true },
  { id: 'more_shapes', label: 'More shapes', disabled: true },
  { divider: true },
  { id: 'diagram', icon: Grid, label: 'Diagram', disabled: true, color: '#f97316' },
];

export default function ShapeFlyout({ activeTool, onSelect }) {
  return (
    <div className="w-56 py-2 bg-white rounded-md shadow-lg border border-gray-100 flex flex-col text-sm text-gray-700">
      {SHAPE_ITEMS.map((item, idx) => {
        if (item.divider) {
          return <div key={`div-${idx}`} className="h-px bg-gray-200 my-2 mx-4" />;
        }

        const isActive = activeTool === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            disabled={item.disabled}
            className={`flex items-center justify-between px-4 py-1.5 mx-2 rounded-md transition-colors
              ${isActive ? 'bg-indigo-50 text-brand' : 'hover:bg-gray-100'}
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center gap-3">
              {item.icon && (
                <item.icon 
                  size={16} 
                  strokeWidth={2}
                  style={{ color: item.color || 'currentColor' }} 
                />
              )}
              <span className={`${isActive ? 'font-medium' : ''}`}>{item.label}</span>
            </div>
            {item.shortcut && (
              <span className="text-xs text-gray-400">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
