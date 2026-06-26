import { useMemo } from 'react';
import { addDays, format } from 'date-fns';
import { TimelineLane, TimelineTask } from '../types';

interface UseTimelineLayoutProps {
  tasks: TimelineTask[];
  lanes: TimelineLane[];
  groupBy: 'dependencies' | 'priority' | 'status' | 'start_date' | 'end_date' | 'task_name';
  sortMode: 'manual' | 'alphabetical' | 'task_count';
  baseDate: Date;
  searchQuery: string;
  activeFilter: string | null;
  headerHeight: number;
  rowHeight: number;
}

export function useTimelineLayout({
  tasks, lanes, groupBy, sortMode, baseDate, searchQuery, activeFilter, headerHeight, rowHeight
}: UseTimelineLayoutProps) {
  
  return useMemo(() => {
    // 1. Flatten base lanes
    const flattenLanes = (nodes: TimelineLane[], level = 0): TimelineLane[] => {
      let result: TimelineLane[] = [];
      for (const node of nodes) {
        result.push({ ...node, level });
        if (node.children && node.isExpanded !== false) {
          result = result.concat(flattenLanes(node.children, level + 1));
        }
      }
      return result;
    };

    let tempVisibleLanes = flattenLanes(lanes);
    
    // 2. Normalize tasks (assign default laneId if missing)
    let normalizedTasks = tasks.map((t, idx) => {
      if (!t.laneId) {
         const laneIndex = t.rowIndex ?? idx;
         const laneId = tempVisibleLanes[laneIndex] ? tempVisibleLanes[laneIndex].id : `lane-${laneIndex}`;
         return { ...t, laneId };
      }
      return t;
    });

    // 3. Apply Grouping
    let dynamicLanes: TimelineLane[] | null = null;
    
    if (groupBy === 'priority') {
      dynamicLanes = [
        { id: 'urgent', title: 'Urgent', type: 'group' },
        { id: 'high', title: 'High', type: 'group' },
        { id: 'medium', title: 'Medium', type: 'group' },
        { id: 'low', title: 'Low', type: 'group' },
        { id: 'none', title: 'No Priority', type: 'group' }
      ];
      normalizedTasks = normalizedTasks.map(t => ({ ...t, dynamicLaneId: t.priority || 'none' }));
    } else if (groupBy === 'status') {
      dynamicLanes = [
        { id: 'not_started', title: 'Not Started', type: 'group' },
        { id: 'in_progress', title: 'In Progress', type: 'group' },
        { id: 'in_review', title: 'In Review', type: 'group' },
        { id: 'done', title: 'Done', type: 'group' },
        { id: 'blocked', title: 'Blocked', type: 'group' }
      ];
      normalizedTasks = normalizedTasks.map(t => ({ ...t, dynamicLaneId: t.status || 'not_started' }));
    } else if (groupBy === 'start_date' || groupBy === 'end_date') {
      const dates = new Set<number>();
      normalizedTasks.forEach(t => {
        if (groupBy === 'start_date') dates.add(t.startOffset);
        else dates.add(t.startOffset + (t.duration || 1));
      });
      
      const sortedOffsets = Array.from(dates).sort((a, b) => a - b);
      dynamicLanes = sortedOffsets.map(offset => {
        const date = addDays(baseDate, offset);
        return { id: `date-${offset}`, title: format(date, 'MMM d, yyyy'), type: 'group', offsetValue: offset };
      });
      
      if (dynamicLanes.length === 0) dynamicLanes.push({ id: 'date-0', title: 'No Dates', type: 'group' });
      
      normalizedTasks = normalizedTasks.map(t => {
        const val = groupBy === 'start_date' ? t.startOffset : (t.startOffset + (t.duration || 1));
        return { ...t, dynamicLaneId: `date-${val}` };
      });
    } else if (groupBy === 'task_name') {
      const names = new Set<string>();
      normalizedTasks.forEach(t => names.add(t.title || 'Untitled'));
      const sortedNames = Array.from(names).sort((a, b) => a.localeCompare(b));
      dynamicLanes = sortedNames.map((name, i) => ({ id: `name-${i}`, title: name, type: 'group', nameValue: name }));
      
      if (dynamicLanes.length === 0) dynamicLanes.push({ id: 'name-0', title: 'No Tasks', type: 'group' });
      
      normalizedTasks = normalizedTasks.map(t => {
        const lane = dynamicLanes?.find(l => l.nameValue === (t.title || 'Untitled'));
        return { ...t, dynamicLaneId: lane ? lane.id : dynamicLanes![0].id };
      });
    }

    // 4. Apply Sorting
    const sortLanes = (nodes: TimelineLane[]): TimelineLane[] => {
      let sorted = [...nodes];
      if (sortMode === 'alphabetical') {
         sorted.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortMode === 'task_count') {
         const getTaskCount = (laneId: string) => normalizedTasks.filter(t => (dynamicLanes ? t.dynamicLaneId : t.laneId) === laneId).length;
         sorted.sort((a, b) => getTaskCount(b.id) - getTaskCount(a.id));
      }
      return sorted.map(node => {
          if (node.children) return { ...node, children: sortLanes(node.children) };
          return node;
      });
    };

    const processedLanes = sortMode === 'manual' ? (dynamicLanes || lanes) : sortLanes(dynamicLanes || lanes);
    const visibleLanes = flattenLanes(processedLanes);

    // 5. Calculate Sub-Lane Index (Collision Detection)
    const laneTasksMap: Record<string, TimelineTask[]> = {};
    visibleLanes.forEach(l => laneTasksMap[l.id] = []);
    normalizedTasks.forEach(t => {
      const targetLaneId = groupBy !== 'dependencies' ? t.dynamicLaneId! : t.laneId!;
      if (laneTasksMap[targetLaneId]) laneTasksMap[targetLaneId].push(t);
    });

    normalizedTasks = normalizedTasks.map(t => ({ ...t, subLaneIndex: 0 }));
    
    const laneSubLaneCounts: Record<string, number> = {};

    Object.keys(laneTasksMap).forEach(laneId => {
       const tasksInLane = laneTasksMap[laneId];
       tasksInLane.sort((a, b) => a.startOffset - b.startOffset);
       
       tasksInLane.forEach((task, idx) => {
          const taskRef = normalizedTasks.find(t => t.id === task.id);
          if (taskRef) taskRef.subLaneIndex = idx;
       });
       
       laneSubLaneCounts[laneId] = Math.max(1, tasksInLane.length);
    });

    // 6. Compute Y Coordinates Layout
    const hasMilestones = normalizedTasks.some(t => t.isMilestone);
    const laneLayouts: (TimelineLane & { y: number; height: number; subCount: number })[] = [];
    let currentYLayout = headerHeight;
    
    if (hasMilestones) {
       laneLayouts.push({ id: 'milestones-lane', title: 'Milestones', type: 'milestones-track', y: currentYLayout, height: rowHeight, subCount: 1 });
       currentYLayout += rowHeight;
    }
    
    for (const lane of visibleLanes) {
       const subCount = laneSubLaneCounts[lane.id] || 1;
       let height = subCount * rowHeight;
       if (lane.type === 'group') {
         height = 28;
       }
       laneLayouts.push({
         ...lane,
         y: currentYLayout,
         height,
         subCount
       });
       currentYLayout += height;
    }
    const requiredHeight = currentYLayout;

    // 7. Apply Filters and Search
    if (searchQuery) {
       const query = searchQuery.toLowerCase();
       normalizedTasks = normalizedTasks.filter(t => (t.title || '').toLowerCase().includes(query) || (t.comment || '').toLowerCase().includes(query));
    }
    
    if (activeFilter === 'urgent_priority') normalizedTasks = normalizedTasks.filter(t => t.priority === 'urgent');
    else if (activeFilter === 'high_priority') normalizedTasks = normalizedTasks.filter(t => t.priority === 'high');
    else if (activeFilter === 'medium_priority') normalizedTasks = normalizedTasks.filter(t => t.priority === 'medium');
    else if (activeFilter === 'low_priority') normalizedTasks = normalizedTasks.filter(t => t.priority === 'low');
    else if (activeFilter === 'has_comments') normalizedTasks = normalizedTasks.filter(t => !!t.comment);

    return {
      visibleLanes,
      laneLayouts,
      normalizedTasks,
      requiredHeight
    };

  }, [tasks, lanes, groupBy, sortMode, baseDate, searchQuery, activeFilter, headerHeight, rowHeight]);
}
