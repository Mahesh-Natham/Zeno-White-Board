import { useState } from 'react';
import { DependencyContext, DragContext } from '../types';

export function useTimelineState() {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [connectingFromTaskId, setConnectingFromTaskId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [selectedDep, setSelectedDep] = useState<DependencyContext | null>(null);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [openPriorityTaskId, setOpenPriorityTaskId] = useState<string | null>(null);
  const [openDurationTaskId, setOpenDurationTaskId] = useState<string | null>(null);
  const [openCommentTaskId, setOpenCommentTaskId] = useState<string | null>(null);
  const [openTaskDetailsId, setOpenTaskDetailsId] = useState<string | null>(null);
  const [editingLaneId, setEditingLaneId] = useState<string | null>(null);
  const [editingHeaderTitle, setEditingHeaderTitle] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showScaleDropdown, setShowScaleDropdown] = useState(false);
  const [showLeftMonthPicker, setShowLeftMonthPicker] = useState(false);
  const [showRightMonthPicker, setShowRightMonthPicker] = useState(false);
  
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [hoveredLaneId, setHoveredLaneId] = useState<string | null>(null);
  const [laneMenuOpenId, setLaneMenuOpenId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [resizingTask, setResizingTask] = useState<DragContext | null>(null); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortMode, setSortMode] = useState<'manual' | 'alphabetical' | 'task_count'>('manual');
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  const [groupBy, setGroupBy] = useState<'dependencies' | 'priority' | 'status' | 'start_date' | 'end_date' | 'task_name'>('dependencies');
  const [showGroupMenu, setShowGroupMenu] = useState(false);

  const clearSelections = () => {
    if (connectingFromTaskId) {
      setConnectingFromTaskId(null);
      return;
    }
    setSelectedTaskId(null);
    setSelectedDep(null);
    setOpenDurationTaskId(null);
    setOpenCommentTaskId(null);
    setOpenPriorityTaskId(null);
    setShowColorPalette(false);
    setLaneMenuOpenId(null);
    setShowSearch(false);
    setShowFilterMenu(false);
    setShowSortMenu(false);
    setShowAddMenu(false);
  };

  return {
    state: {
      editingTaskId, selectedTaskId, hoveredTaskId, connectingFromTaskId, mousePos, selectedDep,
      showColorPalette, openPriorityTaskId, openDurationTaskId, openCommentTaskId, openTaskDetailsId,
      editingLaneId, editingHeaderTitle, showDatePicker, showScaleDropdown, showLeftMonthPicker, showRightMonthPicker,
      selectedLaneId, hoveredLaneId, laneMenuOpenId, showAddMenu, resizingTask,
      searchQuery, showSearch, activeFilter, showFilterMenu, sortMode, showSortMenu,
      groupBy, showGroupMenu
    },
    setters: {
      setEditingTaskId, setSelectedTaskId, setHoveredTaskId, setConnectingFromTaskId, setMousePos, setSelectedDep,
      setShowColorPalette, setOpenPriorityTaskId, setOpenDurationTaskId, setOpenCommentTaskId, setOpenTaskDetailsId,
      setEditingLaneId, setEditingHeaderTitle, setShowDatePicker, setShowScaleDropdown, setShowLeftMonthPicker, setShowRightMonthPicker,
      setSelectedLaneId, setHoveredLaneId, setLaneMenuOpenId, setShowAddMenu, setResizingTask,
      setSearchQuery, setShowSearch, setActiveFilter, setShowFilterMenu, setSortMode, setShowSortMenu,
      setGroupBy, setShowGroupMenu
    },
    clearSelections
  };
}
