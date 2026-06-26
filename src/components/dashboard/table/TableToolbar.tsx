import React from 'react';
import { RefreshCw, Columns, Filter, ArrowUpDown, EyeOff, Download, Search, Plus, Maximize, Check, ArrowRightLeft, LayoutList, Clock } from 'lucide-react';
import { useTableContext } from './TableContext';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function TableToolbar() {
  const { id, columns, toggleColumnVisibility, addRow, searchQuery, setSearchQuery, hideCompleted, setHideCompleted, activeFilter, setActiveFilter, sortMode, setSortMode, rows, settings, updateData } = useTableContext();

  const handleToggleAutoSize = () => {
    const newAutoSize = settings?.autoSize === false ? true : false;
    updateData({ settings: { ...settings, autoSize: newAutoSize } });
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + columns.map(c => c.label).join(",") + "\n" 
      + rows.map(r => columns.map(c => r.cells[c.id]?.value || "").join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "table_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    // Mock refresh logic
    const btn = document.getElementById('refresh-btn');
    if (btn) btn.classList.add('animate-spin');
    setTimeout(() => {
      if (btn) btn.classList.remove('animate-spin');
    }, 1000);
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white">
      <div className="flex items-center space-x-1">
        <button onClick={addRow} className="flex items-center px-2 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors mr-2">
          <Plus className="w-4 h-4 mr-1" />
          New
        </button>
        <button id="refresh-btn" onClick={handleRefresh} title="Refresh" className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors" title="Columns">
              <Columns className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[200px] bg-white rounded-md p-1 shadow-lg border border-gray-100 animate-in fade-in zoom-in-95 z-[9999]" sideOffset={5}>
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Show/Hide Columns</div>
              {columns.map((col) => (
                <DropdownMenu.CheckboxItem
                  key={col.id}
                  className="relative flex h-8 items-center rounded-sm px-8 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 cursor-pointer select-none"
                  checked={col.visible}
                  onCheckedChange={() => toggleColumnVisibility(col.id)}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <DropdownMenu.ItemIndicator>
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    </DropdownMenu.ItemIndicator>
                  </span>
                  {col.label}
                </DropdownMenu.CheckboxItem>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Filter Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button 
              className={`p-1.5 rounded-md transition-colors ${activeFilter ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
              title="Filter"
            >
              <Filter className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[160px] bg-white rounded-md p-1 shadow-lg border border-gray-100 animate-in fade-in zoom-in-95 z-[9999]" sideOffset={5}>
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Quick Filters</div>
              {['high_priority', 'medium_priority', 'low_priority'].map(filter => (
                <DropdownMenu.Item
                  key={filter}
                  className="relative flex h-8 items-center rounded-sm px-3 py-1.5 text-xs outline-none transition-colors hover:bg-gray-100 cursor-pointer justify-between"
                  onSelect={() => setActiveFilter(activeFilter === filter ? null : filter)}
                >
                  <span className="capitalize">{filter.replace('_', ' ')}</span>
                  {activeFilter === filter && <Check size={12} className="text-blue-500" />}
                </DropdownMenu.Item>
              ))}
              {activeFilter && (
                <>
                  <DropdownMenu.Separator className="h-px bg-gray-100 my-1 mx-1" />
                  <DropdownMenu.Item 
                    className="relative flex h-8 items-center rounded-sm px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
                    onSelect={() => setActiveFilter(null)}
                  >
                    Clear Filter
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Sort Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button 
              className={`p-1.5 rounded-md transition-colors ${sortMode !== 'manual' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
              title="Sort"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[160px] bg-white rounded-md p-1 shadow-lg border border-gray-100 animate-in fade-in zoom-in-95 z-[9999]" sideOffset={5}>
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Sort By</div>
              {['manual', 'alphabetical', 'priority'].map(sort => (
                <DropdownMenu.Item
                  key={sort}
                  className="relative flex h-8 items-center rounded-sm px-3 py-1.5 text-xs outline-none transition-colors hover:bg-gray-100 cursor-pointer justify-between"
                  onSelect={() => setSortMode(sort)}
                >
                  <span className="capitalize">{sort}</span>
                  {sortMode === sort && <Check size={12} className="text-blue-500" />}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <button 
          className={`p-1.5 rounded-md transition-colors ${hideCompleted ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
          onClick={() => setHideCompleted(prev => !prev)}
          title="Hide Completed Rows"
        >
          <EyeOff className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarButton icon={Download} title="Export" onClick={handleExport} />
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <div 
          className={`flex items-center gap-2 cursor-pointer transition-colors ${settings?.autoSize !== false ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
          onClick={handleToggleAutoSize}
          title="Toggle Auto-size"
        >
          <Maximize size={16} />
          <span className="text-xs font-medium">Autosize</span>
        </div>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        
        {/* Layout & Convert */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <div className="flex items-center gap-2 cursor-pointer transition-colors text-gray-500 hover:text-gray-800 ml-1">
              <ArrowRightLeft size={16} />
              <span className="text-xs font-medium">Convert</span>
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[140px] bg-white rounded-md p-1 shadow-lg border border-gray-100 animate-in fade-in zoom-in-95 z-[9999]" sideOffset={5}>
              <DropdownMenu.Item 
                className="relative flex h-8 items-center rounded-sm px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 outline-none cursor-pointer gap-2"
                onSelect={() => window.dispatchEvent(new CustomEvent('CONVERT_ELEMENT', { detail: { id: id || '', from: 'table', to: 'kanban' } }))}
              >
                <LayoutList size={14} /> To Kanban
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                className="relative flex h-8 items-center rounded-sm px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 outline-none cursor-pointer gap-2"
                onSelect={() => window.dispatchEvent(new CustomEvent('CONVERT_ELEMENT', { detail: { id: id || '', from: 'table', to: 'timeline' } }))}
              >
                <Clock size={14} /> To Timeline
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
      <div className="flex items-center relative">
        <Search className="w-4 h-4 absolute left-2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="nodrag pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-[200px] transition-all"
        />
      </div>
    </div>
  );
}

function ToolbarButton({ icon: Icon, title, onClick }: { icon: any, title?: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} title={title} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
      <Icon className="w-4 h-4" />
    </button>
  );
}
