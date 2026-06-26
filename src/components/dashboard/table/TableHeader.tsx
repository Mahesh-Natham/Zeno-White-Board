import React, { useRef } from 'react';
import { useTableContext } from './TableContext';
import { Column } from '../../../types/table-types';
import { Bookmark, AlignLeft, CheckCircle2, User, Calendar, Hash, Flag, Square, Plus, Trash2 } from 'lucide-react';

const iconMap: Record<string, any> = {
  text: AlignLeft,
  status: CheckCircle2,
  assignee: User,
  date: Calendar,
  number: Hash,
  checkbox: Square,
};

export function TableHeader() {
  const { columns, updateColumnWidth, addColumn } = useTableContext();
  const visibleColumns = columns.filter(col => col.visible);

  return (
    <div className="flex min-w-full border-b border-gray-100 bg-gray-50/50 text-xs font-medium text-gray-500 sticky top-0 z-20">
      {/* Left padding for icons/number */}
      <div className="w-[80px] flex-shrink-0 sticky left-0 bg-gray-50/50 border-r border-gray-100 z-30" />
      
      {visibleColumns.map((col) => (
        <HeaderCell key={col.id} column={col} onResize={(width) => updateColumnWidth(col.id, width)} />
      ))}
      
      <div 
        className="flex-1 min-w-[60px] flex items-center justify-center border-l border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={addColumn}
      >
        <Plus className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}

function HeaderCell({ column, onResize }: { column: Column, onResize: (w: number) => void }) {
  const { updateColumnLabel, deleteColumn } = useTableContext();
  const Icon = column.id === 'title' ? Bookmark : (iconMap[column.type] || AlignLeft);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);
  const [isEditing, setIsEditing] = React.useState(false);
  const [labelValue, setLabelValue] = React.useState(column.label);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startX.current = e.pageX;
    startWidth.current = column.width;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const delta = e.pageX - startX.current;
    onResize(startWidth.current + delta);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleLabelSubmit = () => {
    setIsEditing(false);
    if (labelValue.trim() && labelValue !== column.label) {
      updateColumnLabel(column.id, labelValue.trim());
    } else {
      setLabelValue(column.label); // Reset if empty
    }
  };

  return (
    <div 
      className="flex items-center px-4 py-3 border-r border-gray-100 last:border-r-0 relative group hover:bg-gray-100/50 transition-colors"
      style={{ width: column.width, minWidth: column.width }}
    >
      <Icon className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
      
      {isEditing ? (
        <input 
          autoFocus
          className="text-xs font-medium text-slate-800 bg-white border border-blue-400 rounded outline-none w-full px-1 shadow-sm"
          value={labelValue}
          onChange={(e) => setLabelValue(e.target.value)}
          onBlur={handleLabelSubmit}
          onKeyDown={(e) => {
             if (e.key === 'Enter') handleLabelSubmit();
          }}
        />
      ) : (
        <span 
          className="truncate flex-1 cursor-text select-none"
          onDoubleClick={() => setIsEditing(true)}
        >
          {column.label}
        </span>
      )}
      
      {/* Delete button (except for title) */}
      {column.id !== 'title' && !isEditing && (
        <button 
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all ml-1 flex-shrink-0"
          onClick={() => deleteColumn(column.id)}
          title="Delete column"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}

      {/* Resizer Handle */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-1.5 bg-blue-300/50 hover:bg-blue-500 z-10 opacity-0 group-hover:opacity-100 transition-opacity nodrag translate-x-1/2"
        style={{ cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 18L2 12l6-6"/><path d="M16 6l6 6-6 6"/><line x1="12" y1="2" x2="12" y2="22"/></svg>') 12 12, col-resize` }}
        onMouseDown={handleMouseDown}
        onPointerDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}
