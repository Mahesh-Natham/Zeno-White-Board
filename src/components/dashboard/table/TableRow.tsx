import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Square } from 'lucide-react';
import { Row } from '../../../types/table-types';
import { useTableContext } from './TableContext';
import { TableCell } from './TableCell';

interface TableRowProps {
  row: Row;
  index: number;
}

export function TableRow({ row, index }: TableRowProps) {
  const { columns } = useTableContext();
  const visibleColumns = columns.filter(col => col.visible);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-table-row flex min-w-full border-b border-gray-100 hover:bg-blue-50/30 transition-colors group relative bg-white ${
        isDragging ? 'shadow-xl ring-1 ring-blue-500 opacity-90' : ''
      }`}
    >
      {/* Row Controls - Fixed Left */}
      <div className="w-[80px] flex items-center justify-center flex-shrink-0 text-gray-400 border-r border-gray-100 group-hover:text-gray-500 bg-white sticky left-0 z-10">
        <div 
          {...attributes} 
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 rounded hover:bg-gray-100"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <Square className="w-3.5 h-3.5 mr-2 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-blue-500 transition-colors" />
        <span className="text-xs font-medium text-gray-400 w-4 text-center">{index + 1}</span>
      </div>

      {/* Cells */}
      {visibleColumns.map((col) => (
        <TableCell key={col.id} column={col} row={row} />
      ))}
      
      {/* Empty space at end */}
      <div className="flex-1 min-w-[60px] border-l border-gray-100" />
    </div>
  );
}
