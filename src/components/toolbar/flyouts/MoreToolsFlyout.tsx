import { 
  Smartphone,
  Network,

  FileText,
  MonitorPlay,
  Activity,
  AppWindow
} from 'lucide-react';

const FORMATS = [
  { id: 'google_workspace', icon: AppWindow, label: 'Google Workspace', desc: 'Embed Docs, Sheets, and Slides', badge: 'New', badgeColor: 'bg-green-100 text-green-700', iconColor: 'text-green-600', borderColor: 'border-green-600/30' },
  { id: 'doc', icon: FileText, label: 'Doc', desc: 'Organise your thoughts in a document', iconColor: 'text-[#0284C7]', borderColor: 'border-[#0284C7]/30' },
  { id: 'slides', icon: MonitorPlay, label: 'Slides', desc: 'Showcase your work with slides', iconColor: 'text-[#DC2626]', borderColor: 'border-[#DC2626]/30' }
];

export default function MoreToolsFlyout({ onSelect }) {
  return (
    <div className="w-[340px] bg-white rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col text-sm text-gray-900 overflow-hidden" style={{ maxHeight: 'calc(100vh - 120px)' }}>
      {/* Tabs Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <button className="px-3 py-1.5 bg-[#EFF6FF] text-[#2563EB] font-semibold rounded-md">
          Tools
        </button>
        <button className="px-3 py-1.5 text-gray-500 font-medium hover:text-gray-900 transition-colors">
          Marketplace
        </button>
      </div>

      <div className="overflow-y-auto custom-scrollbar p-2">
        {/* Formats Section */}
        <div className="px-3 pt-2 pb-1">
          <h3 className="font-bold text-[15px]">Formats</h3>
        </div>

        <div className="flex flex-col">
          {FORMATS.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect && onSelect(item.id)}
              className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50 text-left w-full group"
            >
              <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border ${item.borderColor} bg-white group-hover:bg-gray-50`}>
                <item.icon size={20} strokeWidth={2} className={item.iconColor} />
              </div>
              <div className="flex flex-col flex-1 leading-snug">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[15px]">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-gray-500 text-[13px] mt-0.5">{item.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
