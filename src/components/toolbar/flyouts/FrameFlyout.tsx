import { 
  SquareDashed, 
  File, 
  FileText, 
  Monitor, 
  Smartphone, 
  Tablet,
  Presentation,
  Grid,
  Activity
} from 'lucide-react';

const FRAME_SIZES = [
  { id: 'custom', icon: SquareDashed, label: 'Custom', isCustom: true },
  { id: 'a4', icon: File, label: 'A4', width: 2100, height: 2970 },
  { id: 'letter', icon: FileText, label: 'Letter', width: 2550, height: 3300 },
  { id: '16_9', icon: Monitor, label: '16:9', width: 1920, height: 1080 },
  { id: '4_3', icon: Monitor, label: '4:3', width: 1024, height: 768 },
  { id: '1_1', icon: SquareDashed, label: '1:1', width: 1080, height: 1080 },
  { id: 'mobile', icon: Smartphone, label: 'Mobile', width: 375, height: 812 },
  { id: 'tablet', icon: Tablet, label: 'Tablet', width: 768, height: 1024 },
  { id: 'desktop', icon: Monitor, label: 'Desktop', width: 1440, height: 900 },
];

const FRAME_TOOLS = [
  { id: 'slides', icon: Presentation, label: 'Slides', color: '#ef4444' },
  { id: 'diagram', icon: Grid, label: 'Diagram', color: '#f97316' },
  { id: 'engage', icon: Activity, label: 'Engage activities', badge: 'Free beta', badgeColor: 'bg-gray-100 text-gray-700', color: '#ef4444' },
  { id: 'prototype', icon: Smartphone, label: 'Prototype', badge: 'Add-on', badgeColor: 'bg-indigo-100 text-indigo-700', color: '#6366f1' },
];

export default function FrameFlyout({ onSelect }) {
  return (
    <div className="w-72 py-2 bg-white rounded-md shadow-lg border border-gray-100 flex flex-col text-sm text-gray-700">
      <div className="grid grid-cols-3 gap-y-4 gap-x-2 px-4 py-2">
        {FRAME_SIZES.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex flex-col items-center gap-1.5 opacity-75 hover:opacity-100 hover:text-brand transition-colors"
          >
            <item.icon size={24} strokeWidth={1.5} />
            <span className="text-[11px]">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="h-px bg-gray-200 my-2 mx-4" />

      <div className="flex flex-col">
        {FRAME_TOOLS.map((item) => (
          <button
            key={item.id}
            className="flex items-center gap-3 px-4 py-2 mx-2 rounded-md transition-colors hover:bg-gray-100 cursor-not-allowed opacity-75"
            title="Coming Soon"
          >
            <item.icon 
              size={18} 
              strokeWidth={2}
              style={{ color: item.color }} 
            />
            <span>{item.label}</span>
            {item.badge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor} ml-auto`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
