import { 
  Smartphone,
  Network,
  Table,
  GitCommit,
  Kanban,
  FileText,
  MonitorPlay,
  Activity,
  Workflow
} from 'lucide-react';

const CREATION_TOOLS = [
  { id: 'diagram', icon: Network, label: 'Diagram', iconColor: 'text-[#EA580C]', borderColor: 'border-[#EA580C]/30' },
  { id: 'table', icon: Table, label: 'Table', iconColor: 'text-[#16A34A]', borderColor: 'border-[#16A34A]/30' },
  { id: 'timeline', icon: GitCommit, label: 'Timeline', iconColor: 'text-[#16A34A]', borderColor: 'border-[#16A34A]/30' },
  { id: 'kanban', icon: Kanban, label: 'Kanban', iconColor: 'text-[#16A34A]', borderColor: 'border-[#16A34A]/30' },
  { id: 'doc', icon: FileText, label: 'Doc', iconColor: 'text-[#0284C7]', borderColor: 'border-[#0284C7]/30' }
];

export default function CreationFlyout({ onSelect }) {
  return (
    <div className="w-56 bg-white rounded-md shadow-floating border border-gray-100 flex flex-col text-sm text-gray-900 overflow-hidden py-1">
      {CREATION_TOOLS.map((item, idx) => {
        if (item.isDivider) {
          return <div key={`div-${idx}`} className="h-px bg-gray-200 my-1 mx-3" />;
        }
        
        return (
          <button
            key={item.id}
            onClick={() => onSelect && onSelect(item.id)}
            className="flex items-center gap-3 px-3 py-2 mx-1 rounded-md transition-colors hover:bg-gray-50 text-left group"
          >
            <item.icon size={18} strokeWidth={2} className={`${item.iconColor}`} />
            <div className="flex items-center gap-2 flex-1">
              <span className="font-medium text-gray-700 text-[14px]">{item.label}</span>
              {item.badge && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor} ml-auto`}>
                  {item.badge}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
