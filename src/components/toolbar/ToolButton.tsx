import { LucideIcon } from 'lucide-react';

interface ToolButtonProps {
  icon: LucideIcon | React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  shortcut?: string;
  customClass?: string;
  iconClass?: string;
}

export default function ToolButton({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick, 
  shortcut,
  customClass,
  iconClass
}: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative group flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200
        ${customClass ? customClass : (isActive 
          ? 'bg-brand/10 text-brand shadow-sm ring-1 ring-brand/20' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')}
      `}
      title={`${label} ${shortcut ? `(${shortcut})` : ''}`}
    >
      <Icon className={`w-4 h-4 ${iconClass ? iconClass : (isActive ? 'stroke-[2.5px]' : 'stroke-2')}`} />
      
      {/* Tooltip */}
      <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
        {label}
        {shortcut && <span className="ml-2 text-gray-400 font-mono">{shortcut}</span>}
        {/* Tooltip Arrow */}
        <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
      </div>
    </button>
  );
}
