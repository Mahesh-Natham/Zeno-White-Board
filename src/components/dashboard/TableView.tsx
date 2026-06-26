import React from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TableProperties, Maximize2, MoreVertical } from 'lucide-react';
import { useTableContext } from './table/TableContext';
import { TableToolbar } from './table/TableToolbar';
import { TableHeader } from './table/TableHeader';
import { TableRow } from './table/TableRow';

export default function TableView() {
  const { rows, moveRow, addRow, searchQuery, title, updateData, hideCompleted, columns, activeFilter, sortMode } = useTableContext();
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState(title || 'Table view');

  React.useEffect(() => {
    setTitleInput(title || 'Table view');
  }, [title]);

  const handleUpdateTitle = () => {
    if (titleInput.trim() !== title) {
      updateData({ title: titleInput.trim() || 'Table view' });
    }
    setIsEditingTitle(false);
  };

  const filteredRows = React.useMemo(() => {
    let result = [...rows]; // Make a copy for sorting
    
    // 1. Hide completed
    if (hideCompleted) {
      const statusCols = columns.filter(c => c.type === 'status').map(c => c.id);
      result = result.filter(row => {
        const isCompleted = statusCols.some(colId => row.cells[colId]?.value === 'Done');
        return !isCompleted;
      });
    }

    // 2. Active filter
    if (activeFilter) {
      const priorityVal = activeFilter === 'high_priority' ? 'High' 
                        : activeFilter === 'medium_priority' ? 'Medium' 
                        : 'Low';
      const priorityCols = columns.filter(c => c.id.toLowerCase().includes('priority') || c.label.toLowerCase().includes('priority')).map(c => c.id);
      
      if (priorityCols.length > 0) {
        result = result.filter(row => {
          return priorityCols.some(colId => row.cells[colId]?.value === priorityVal);
        });
      }
    }

    // 3. Search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(row => 
        Object.values(row.cells).some(cell => 
          String(cell.value || "").toLowerCase().includes(lowerQuery)
        )
      );
    }

    // 4. Sorting
    if (sortMode === 'alphabetical') {
      const titleCol = columns.find(c => c.id === 'title')?.id || columns[0]?.id;
      if (titleCol) {
        result.sort((a, b) => {
          const valA = String(a.cells[titleCol]?.value || '').toLowerCase();
          const valB = String(b.cells[titleCol]?.value || '').toLowerCase();
          return valA.localeCompare(valB);
        });
      }
    } else if (sortMode === 'priority') {
      const priorityCol = columns.find(c => c.id.toLowerCase().includes('priority') || c.label.toLowerCase().includes('priority'))?.id;
      if (priorityCol) {
        const priorityOrder: Record<string, number> = { 'High': 1, 'Medium': 2, 'Low': 3 };
        result.sort((a, b) => {
          const valA = a.cells[priorityCol]?.value as string;
          const valB = b.cells[priorityCol]?.value as string;
          return (priorityOrder[valA] || 99) - (priorityOrder[valB] || 99);
        });
      }
    }
    
    return result;
  }, [rows, searchQuery, hideCompleted, activeFilter, sortMode, columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts, allows clicking buttons
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveRow(active.id as string, over.id as string);
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-dashboard-card rounded-lg shadow-sm border border-slate-200 dark:border-dashboard-border overflow-hidden font-sans flex flex-col transition-all duration-300 pointer-events-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-dashboard-border bg-slate-50/50 dark:bg-dashboard-darker/30 table-draggable-zone">
        <div className="flex items-center space-x-1.5 pointer-events-auto">
          <div className="flex items-center space-x-1.5 bg-white dark:bg-dashboard-card px-2.5 py-1 rounded-md border border-slate-200 dark:border-dashboard-border shadow-sm">
            <TableProperties className="w-3.5 h-3.5 text-emerald-550 dark:text-emerald-500" />
            {isEditingTitle ? (
              <input
                autoFocus
                className="text-xs font-medium text-slate-800 bg-transparent border-b border-blue-500 outline-none w-[150px]"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                  e.stopPropagation();
                }}
              />
            ) : (
              <span 
                className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-text hover:bg-slate-100 rounded px-1 -ml-1 transition-colors"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
              >
                {title || 'Table view'}
              </span>
            )}
          </div>
          <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors nodrag">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors nodrag">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="pointer-events-auto">
        <TableToolbar />
      </div>

      {/* Table Container - Overflow handles horizontal scroll */}
      <div className="flex-1 overflow-auto bg-gray-50/10 table-scroll-container pointer-events-auto">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="inline-flex flex-col min-w-full pb-10">
            <TableHeader />
            
            <SortableContext 
              items={filteredRows.map(r => r.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredRows.map((row, index) => (
                <TableRow key={row.id} row={row} index={index} />
              ))}
            </SortableContext>
            
            {/* Add Row Button */}
            <div 
              className="flex w-full items-center py-2 hover:bg-gray-50 cursor-pointer transition-colors text-gray-400 hover:text-gray-600 border-b border-gray-100"
              onClick={addRow}
            >
              <div className="w-[80px] flex justify-center border-r border-gray-100/50">
                <TableProperties className="w-4 h-4 opacity-0" /> {/* Spacer */}
              </div>
              <div className="text-sm font-medium px-4 py-2 text-blue-500 hover:text-blue-600 flex items-center">
                + New row
              </div>
            </div>

          </div>
        </DndContext>
      </div>
    </div>
  );
}
