import React, { useRef } from 'react';
import { Html } from 'react-konva-utils';
import { Group } from 'react-konva';
import { FolderPlus, ChevronDown, Search, X, Filter, Check, ArrowUpDown, LayoutList, LayoutPanelLeft, Download, Maximize, Palette, Clock, Sparkles, Type, ArrowRightLeft } from 'lucide-react';
import { KanbanData } from '../../types';
import { useKanbanUIStore } from '../../store';
import { calculateKanbanWidth } from '../../utils';
import useToolStore from '../../../../../../store/toolStore';
import { TOOLS } from '../../../../../../config/constants';

interface KanbanHeaderProps {
  elementId: string;
  data: KanbanData;
  onUpdateData: (updates: Partial<KanbanData>) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export function KanbanHeader({
  elementId,
  data,
  onUpdateData,
  onPointerDown
}: KanbanHeaderProps) {
  
  const { 
    searchQuery, setSearchQuery, 
    filterState, clearFilters, 
    groupBy, setGroupBy 
  } = useKanbanUIStore();

  const activeTool = useToolStore((state) => state.activeTool);
  const isConnecting = [TOOLS.ARROW, TOOLS.LINE, TOOLS.ELBOW_ARROW, TOOLS.SMART_CONNECTOR].includes(activeTool as any);

  const handleGroupByChange = (newGroupBy: string) => {
    setGroupBy(newGroupBy as any);
    if (data.settings?.autoSize !== false) {
      const newWidth = calculateKanbanWidth(data.columns, data.settings, newGroupBy as any);
      onUpdateData({ _elementWidth: newWidth } as any);
    }
  };

  const handleToggleAutoSize = () => {
    const isAuto = data.settings?.autoSize !== false;
    const newSettings = { ...data.settings, autoSize: !isAuto };
    if (!isAuto) {
      const expectedWidth = calculateKanbanWidth(data.columns, newSettings, groupBy);
      onUpdateData({ settings: newSettings, _elementWidth: expectedWidth } as any);
    } else {
      onUpdateData({ settings: newSettings });
    }
  };

  // Local state for dropdowns
  const [showSearch, setShowSearch] = React.useState(false);
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [showGroupMenu, setShowGroupMenu] = React.useState(false);
  const [showAddMenu, setShowAddMenu] = React.useState(false);
  const [showAppearanceMenu, setShowAppearanceMenu] = React.useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = React.useState(false);

  const headerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
        setShowFilterMenu(false);
        setShowSortMenu(false);
        setShowGroupMenu(false);
        setShowSearch(false);
        setShowAppearanceMenu(false);
        setShowLayoutMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddMenu(false);
        setShowFilterMenu(false);
        setShowSortMenu(false);
        setShowGroupMenu(false);
        setShowSearch(false);
        setShowAppearanceMenu(false);
        setShowLayoutMenu(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Group x={0} y={0}>
      <Html groupProps={{ x: 0, y: -80 }} divProps={{ style: { position: 'absolute', zIndex: 60, pointerEvents: 'none' } }}>
        <div 
          className={`flex flex-col gap-2 ${isConnecting ? 'pointer-events-none-all' : ''}`}
          onWheel={e => {
            const canvas = document.querySelector('canvas');
            if (canvas) canvas.dispatchEvent(new WheelEvent('wheel', { deltaX: e.deltaX, deltaY: e.deltaY, clientX: e.clientX, clientY: e.clientY, bubbles: true }));
          }}
        >
          {/* Board Title */}
          <input
            type="text"
            className="text-xl font-bold text-gray-800 bg-transparent outline-none min-w-[200px] w-[300px] placeholder-gray-400 focus:ring-2 focus:ring-blue-100 rounded px-1 transition-all pointer-events-auto kanban-drag-handle"
            value={data.title ?? ''}
            onChange={(e) => onUpdateData({ title: e.target.value } as any)}
            onKeyDown={(e) => e.stopPropagation()}
            onPointerDown={onPointerDown}
            onMouseDown={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === 'INPUT') e.stopPropagation();
            }}
            placeholder="Board Title..."
          />
          
          <div 
            ref={headerRef}
            className="flex items-center gap-4 px-4 h-[40px] bg-white border border-gray-200 rounded-lg shadow-sm pointer-events-auto kanban-drag-handle w-fit" 
            onPointerDown={onPointerDown}
            onMouseDown={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.tagName === 'SELECT' || target.closest('.cursor-pointer')) {
                e.stopPropagation();
              }
            }}
          >

          {/* Add Column */}
          <div className="relative">
            <div 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
            >
              <FolderPlus size={16} />
              <span className="text-xs font-semibold">Column</span>
              <ChevronDown size={14} className="ml-1" />
            </div>
            {showAddMenu && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50">
                <button 
                  onClick={() => {
                    const newColumnId = `col-${Date.now()}`;
                    onUpdateData({
                      columns: [...data.columns, {
                        id: newColumnId,
                        title: 'New Column',
                        color: '#3B82F6',
                        position: data.columns.length,
                        isCollapsed: false,
                        isDone: false
                      }]
                    });
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium"
                >
                  + New Column
                </button>
              </div>
            )}
          </div>
          
          <div className="w-px h-4 bg-gray-200"></div>
          
          {/* Search */}
          <div className="relative flex items-center">
            {showSearch ? (
              <div className="flex items-center">
                <Search size={14} className="text-gray-400 absolute left-2" />
                <input 
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cards..."
                  className="text-xs pl-7 pr-6 py-1 border border-blue-400 rounded outline-none w-48 transition-all"
                  onKeyDown={e => e.stopPropagation()}
                />
                <X size={14} className="text-gray-400 absolute right-2 cursor-pointer hover:text-gray-600" onClick={() => { setSearchQuery(''); setShowSearch(false); }} />
              </div>
            ) : (
              <div 
                onClick={() => setShowSearch(true)}
                className={`flex items-center gap-2 cursor-pointer transition-colors ${searchQuery ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
              >
                <Search size={16} />
                <span className="text-xs font-medium">Search</span>
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-gray-200"></div>
          
          {/* Filter */}
          <div className="relative">
            <div 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${filterState.labelIds.length || filterState.assigneeIds.length ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <Filter size={16} />
              <span className="text-xs font-medium">Filter</span>
            </div>
            {showFilterMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50 text-xs text-gray-500 px-3 py-2">
                Filters mapped via Sidebar (Coming soon)
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-gray-200"></div>

          {/* Sort */}
          <div className="relative">
            <div 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`flex items-center gap-2 cursor-pointer transition-colors text-gray-500 hover:text-gray-800`}
            >
              <ArrowUpDown size={16} />
              <span className="text-xs font-medium">Sort</span>
            </div>
            {showSortMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50">
                {['none', 'startDate', 'priority'].map(sort => (
                  <button 
                    key={sort}
                    onClick={() => { onUpdateData({ settings: { ...data.settings, sort: sort as any } }); setShowSortMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="capitalize">{sort}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-gray-200"></div>

          {/* Group By */}
          <div className="relative">
            <div 
              onClick={() => setShowGroupMenu(!showGroupMenu)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${groupBy !== 'none' ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <LayoutList size={16} />
              <span className="text-xs font-medium">Group</span>
            </div>
            {showGroupMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'assignee', label: 'Assignee' },
                  { id: 'priority', label: 'Priority' },
                  { id: 'label', label: 'Label' },
                  { id: 'lane', label: 'Custom Lanes' }
                ].map(group => (
                  <button 
                    key={group.id}
                    onClick={() => { handleGroupByChange(group.id); setShowGroupMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>{group.label}</span>
                    {groupBy === group.id && <Check size={12} className="text-blue-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-gray-200"></div>

          {/* Autosize */}
          <div 
            onClick={handleToggleAutoSize}
            className={`flex items-center gap-2 cursor-pointer transition-colors ${data.settings?.autoSize !== false ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
            title="Toggle Auto-size"
          >
            <Maximize size={16} />
            <span className="text-xs font-medium">Autosize</span>
          </div>

          <div className="w-px h-4 bg-gray-200"></div>

          {/* Appearance Menu */}
          <div className="relative">
            <div 
              onClick={() => setShowAppearanceMenu(!showAppearanceMenu)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${data.settings?.textColor || data.settings?.fontFamily ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <Palette size={16} />
              <span className="text-xs font-medium">Appearance</span>
            </div>
            {showAppearanceMenu && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 shadow-xl rounded-md p-3 z-50 text-xs cursor-default">
                
                <div className="mb-4">
                  <div className="text-gray-500 font-semibold mb-2 flex items-center gap-1"><Type size={12}/> Font Family</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: '', label: 'Default' },
                      { id: 'serif', label: 'Serif' },
                      { id: 'monospace', label: 'Monospace' },
                      { id: 'cursive', label: 'Cursive' }
                    ].map(f => (
                      <button 
                        key={f.id}
                        className={`text-left px-2 py-1.5 border rounded transition-colors ${data.settings?.fontFamily === f.id ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                        style={{ fontFamily: f.id || 'inherit' }}
                        onClick={() => onUpdateData({ settings: { ...data.settings, fontFamily: f.id } } as any)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500 font-semibold mb-2 flex items-center gap-1"><Palette size={12}/> Text Color</div>
                  <div className="flex gap-2">
                    {[
                      { id: '', color: '#374151', label: 'Default' },
                      { id: '#2563EB', color: '#2563EB', label: 'Blue' },
                      { id: '#9333EA', color: '#9333EA', label: 'Purple' },
                      { id: '#16A34A', color: '#16A34A', label: 'Green' },
                      { id: '#DC2626', color: '#DC2626', label: 'Red' },
                      { id: '#EA580C', color: '#EA580C', label: 'Orange' },
                    ].map(c => (
                      <button 
                        key={c.id}
                        title={c.label}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${data.settings?.textColor === c.id ? 'border-blue-400 scale-110 shadow-sm' : 'border-transparent'}`}
                        style={{ backgroundColor: c.color }}
                        onClick={() => onUpdateData({ settings: { ...data.settings, textColor: c.id } } as any)}
                      />
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          <div className="w-px h-4 bg-gray-200"></div>

          {/* Layout & Convert */}
          <div className="relative">
            <div 
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${showLayoutMenu ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <ArrowRightLeft size={16} />
              <span className="text-xs font-medium">Convert</span>
            </div>
            {showLayoutMenu && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50 text-xs">
                <button 
                  onClick={() => {
                    // if(onChange) onChange(elementId, { type: 'timeline' });
                    setShowLayoutMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Clock size={14} /> To Timeline
                </button>
                <button 
                  onClick={() => {
                    // if(onChange) onChange(elementId, { type: 'table' });
                    setShowLayoutMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LayoutPanelLeft size={14} /> To Table
                </button>
              </div>
            )}
          </div>

          <div className="flex-1"></div>

          {/* Export */}
          <div 
            onClick={() => {}}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
          >
            <Download size={16} />
            <span className="text-xs font-semibold">Export</span>
          </div>
        </div>
        </div>
      </Html>
    </Group>
  );
}
