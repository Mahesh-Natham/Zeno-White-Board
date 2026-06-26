import React, { useState } from 'react';
import { Html } from 'react-konva-utils';
import { Group } from 'react-konva';
import { FolderPlus, ChevronDown, Search, X, Filter, Check, ArrowUpDown, LayoutList, LayoutPanelLeft, Download, ArrowRightLeft } from 'lucide-react';
import { TimelineLane, TimelineTask } from '../types';

interface TimelineHeaderProps {
  elementId: string;
  title: string;
  lanes: TimelineLane[];
  tasks: TimelineTask[];
  onChange?: (id: string, updates: any) => void;
  state: any;
  setters: any;
  addMenuRef: React.RefObject<HTMLDivElement>;
  filterMenuRef: React.RefObject<HTMLDivElement>;
  sortMenuRef: React.RefObject<HTMLDivElement>;
  groupMenuRef: React.RefObject<HTMLDivElement>;
  elementLocked?: boolean;
}

export function TimelineHeader({
  elementId,
  title,
  lanes,
  tasks,
  onChange,
  state,
  setters,
  addMenuRef,
  filterMenuRef,
  sortMenuRef,
  groupMenuRef,
  elementLocked
}: TimelineHeaderProps) {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  
  const {
    showAddMenu, searchQuery, showSearch, activeFilter, showFilterMenu, sortMode, showSortMenu, groupBy, showGroupMenu
  } = state;
  
  const {
    setShowAddMenu, setSearchQuery, setShowSearch, setActiveFilter, setShowFilterMenu, setSortMode, setShowSortMenu, setGroupBy, setShowGroupMenu
  } = setters;

  return (
    <Group x={0} y={0}>
      <Html groupProps={{ x: 0, y: -52 }} divProps={{ style: { position: 'absolute', zIndex: 60 } }}>
        <div 
          className={`flex items-center gap-4 px-4 h-[40px] bg-white border border-gray-200 rounded-lg shadow-sm pointer-events-auto ${elementLocked ? 'opacity-50 pointer-events-none' : ''}`} 
          onMouseDown={e => e.stopPropagation()}
          onWheel={e => {
            const canvas = document.querySelector('canvas');
            if (canvas) canvas.dispatchEvent(new WheelEvent('wheel', { deltaX: e.deltaX, deltaY: e.deltaY, clientX: e.clientX, clientY: e.clientY, bubbles: true }));
          }}
        >
          {/* Add Group/Record */}
          <div className="relative" ref={addMenuRef}>
            <div 
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
            >
              <FolderPlus size={16} />
              <span className="text-xs font-semibold">Group</span>
              <ChevronDown size={14} className="ml-1" />
            </div>
            {showAddMenu && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50">
                <button 
                  onClick={() => {
                    const newGroup: TimelineLane = { id: `group-${Date.now()}`, title: 'New Group', type: 'group', isExpanded: true, children: [] };
                    if (onChange) onChange(elementId, { lanes: [...lanes, newGroup] });
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium"
                >
                  + New Group
                </button>
                <button 
                  onClick={() => {
                    const newRecord: TimelineLane = { id: `lane-${Date.now()}`, title: 'New Record', type: 'record' };
                    const newTask: TimelineTask = { id: `task-${Date.now()}`, title: 'New Task', startOffset: 0, duration: 3, color: '#3b82f6', laneId: newRecord.id };
                    if (onChange) onChange(elementId, { lanes: [...lanes, newRecord], tasks: [...tasks, newTask] });
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium"
                >
                  + New Record
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
                  placeholder="Search tasks..."
                  className="text-xs pl-7 pr-6 py-1 border border-blue-400 rounded outline-none w-48 transition-all"
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
          <div className="relative" ref={filterMenuRef}>
            <div 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${activeFilter ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <Filter size={16} />
              <span className="text-xs font-medium">Filter</span>
            </div>
            {showFilterMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50">
                {['urgent_priority', 'high_priority', 'medium_priority', 'low_priority', 'has_comments'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => { setActiveFilter(activeFilter === filter ? null : filter); setShowFilterMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="capitalize">{filter.replace('_', ' ')}</span>
                    {activeFilter === filter && <Check size={12} className="text-blue-500" />}
                  </button>
                ))}
                {activeFilter && (
                  <>
                    <div className="h-px bg-gray-100 my-1 mx-1"></div>
                    <button onClick={() => { setActiveFilter(null); setShowFilterMenu(false); }} className="w-full text-left px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">Clear Filter</button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-gray-200"></div>

          {/* Sort */}
          <div className="relative" ref={sortMenuRef}>
            <div 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${sortMode !== 'manual' ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <ArrowUpDown size={16} />
              <span className="text-xs font-medium">Sort</span>
            </div>
            {showSortMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50">
                {['manual', 'alphabetical', 'task_count'].map(sort => (
                  <button 
                    key={sort}
                    onClick={() => { setSortMode(sort as any); setShowSortMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="capitalize">{sort.replace('_', ' ')}</span>
                    {sortMode === sort && <Check size={12} className="text-blue-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-gray-200"></div>

          {/* Group By */}
          <div className="relative" ref={groupMenuRef}>
            <div 
              onClick={() => setShowGroupMenu(!showGroupMenu)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${groupBy !== 'dependencies' ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <LayoutList size={16} />
              <span className="text-xs font-medium">Group</span>
            </div>
            {showGroupMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50">
                {[
                  { id: 'dependencies', label: 'Dependencies (Manual)' },
                  { id: 'priority', label: 'Priority' },
                  { id: 'status', label: 'Status' },
                  { id: 'start_date', label: 'Start Date' },
                  { id: 'end_date', label: 'End Date' },
                  { id: 'task_name', label: 'Task Name' }
                ].map(group => (
                  <button 
                    key={group.id}
                    onClick={() => { setGroupBy(group.id); setShowGroupMenu(false); }}
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
                  onClick={() => { if(onChange) onChange(elementId, { type: 'kanban' }); setShowLayoutMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LayoutPanelLeft size={14} /> To Kanban
                </button>
                <button 
                  onClick={() => { if(onChange) onChange(elementId, { type: 'table' }); setShowLayoutMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LayoutList size={14} /> To Table
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
      </Html>
    </Group>
  );
}
