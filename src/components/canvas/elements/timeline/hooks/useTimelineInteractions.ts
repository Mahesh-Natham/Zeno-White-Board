import { useCallback } from 'react';
import { TimelineLane, TimelineTask } from '../types';

interface UseTimelineInteractionsProps {
  elementId: string;
  tasks: TimelineTask[];
  lanes: TimelineLane[];
  onChange?: (id: string, updates: any) => void;
}

export function useTimelineInteractions({ elementId, tasks, lanes, onChange }: UseTimelineInteractionsProps) {

  const updateTask = useCallback((taskId: string, updates: Partial<TimelineTask>) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    if (onChange) onChange(elementId, { tasks: newTasks });
  }, [tasks, elementId, onChange]);

  const updateMultipleTasks = useCallback((updatesList: {id: string, updates: Partial<TimelineTask>}[]) => {
    let newTasks = [...tasks];
    updatesList.forEach(tu => {
       newTasks = newTasks.map(t => t.id === tu.id ? { ...t, ...tu.updates } : t);
    });
    if (onChange) onChange(elementId, { tasks: newTasks });
  }, [tasks, elementId, onChange]);

  const updateLaneRecursively = useCallback((lanesList: TimelineLane[], id: string, updater: (lane: TimelineLane) => TimelineLane): TimelineLane[] => {
    return lanesList.map(lane => {
      if (lane.id === id) {
        return updater(lane);
      }
      if (lane.children) {
        return { ...lane, children: updateLaneRecursively(lane.children, id, updater) };
      }
      return lane;
    });
  }, []);

  const deleteLaneRecursively = useCallback((lanesList: TimelineLane[], id: string): TimelineLane[] => {
    return lanesList.filter(lane => lane.id !== id).map(lane => {
      if (lane.children) {
        return { ...lane, children: deleteLaneRecursively(lane.children, id) };
      }
      return lane;
    });
  }, []);

  const getLaneRecursively = useCallback((lanesList: TimelineLane[], id: string): TimelineLane | null => {
    for (const lane of lanesList) {
      if (lane.id === id) return lane;
      if (lane.children) {
        const found = getLaneRecursively(lane.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const insertLaneBefore = useCallback((list: TimelineLane[], targetId: string, item: TimelineLane): TimelineLane[] => {
    let res: TimelineLane[] = [];
    for (const l of list) {
      if (l.id === targetId) res.push(item, l);
      else if (l.children) res.push({ ...l, children: insertLaneBefore(l.children, targetId, item) });
      else res.push(l);
    }
    return res;
  }, []);

  const insertLaneAfter = useCallback((list: TimelineLane[], targetId: string, item: TimelineLane): TimelineLane[] => {
    let res: TimelineLane[] = [];
    for (const l of list) {
      if (l.id === targetId) res.push(l, item);
      else if (l.children) res.push({ ...l, children: insertLaneAfter(l.children, targetId, item) });
      else res.push(l);
    }
    return res;
  }, []);

  const insertLaneAsFirstChild = useCallback((list: TimelineLane[], targetGroupId: string, item: TimelineLane): TimelineLane[] => {
    return list.map(l => {
       if (l.id === targetGroupId) return { ...l, children: [item, ...(l.children || [])] };
       if (l.children) return { ...l, children: insertLaneAsFirstChild(l.children, targetGroupId, item) };
       return l;
    });
  }, []);

  const reorderLane = useCallback((lanesList: TimelineLane[], sourceId: string, targetVisibleIndex: number, visibleLanesArray: TimelineLane[]) => {
    const laneToMove = getLaneRecursively(lanesList, sourceId);
    if (!laneToMove) return lanesList;
    
    let targetIdx = Math.max(0, Math.min(targetVisibleIndex, visibleLanesArray.length - 1));
    const targetLane = visibleLanesArray[targetIdx];
    if (targetLane.id === sourceId) return lanesList;

    const sourceIdx = visibleLanesArray.findIndex(l => l.id === sourceId);
    const isMovingDown = targetIdx > sourceIdx;

    let newLanes = deleteLaneRecursively(lanesList, sourceId);

    if (targetLane.type === 'group') {
       if (isMovingDown) return insertLaneAsFirstChild(newLanes, targetLane.id, laneToMove);
       else return insertLaneBefore(newLanes, targetLane.id, laneToMove);
    } else {
       if (isMovingDown) return insertLaneAfter(newLanes, targetLane.id, laneToMove);
       else return insertLaneBefore(newLanes, targetLane.id, laneToMove);
    }
  }, [deleteLaneRecursively, getLaneRecursively, insertLaneAfter, insertLaneAsFirstChild, insertLaneBefore]);

  const handleTaskDragEnd = useCallback((
    e: any, 
    task: TimelineTask, 
    pixelsPerDay: number, 
    laneLayouts: any[], 
    headerHeight: number, 
    barHeight: number, 
    groupBy: string,
    normalizedTasks: TimelineTask[]
  ) => {
    e.cancelBubble = true; 
    e.target.lastDispatchedRowIndex = undefined;
    
    const newX = e.target.x(); 
    const newY = e.target.y();
    let newStartOffset = Math.round(newX / pixelsPerDay);
    newStartOffset = Math.max(0, newStartOffset);
    
    const centerY = newY + barHeight / 2;
    let droppedLane = laneLayouts.find(l => centerY >= l.y && centerY < l.y + l.height);
    if (!droppedLane && centerY < headerHeight && laneLayouts.length > 0) droppedLane = laneLayouts[0];
    if (!droppedLane && laneLayouts.length > 0 && centerY >= laneLayouts[laneLayouts.length - 1].y + laneLayouts[laneLayouts.length - 1].height) droppedLane = laneLayouts[laneLayouts.length - 1];
    
    let updates: Partial<TimelineTask> = { startOffset: newStartOffset };
    let occupantUpdates: any = null;
    
    if (!task.isMilestone && droppedLane) {
       if (groupBy === 'priority') {
         updates.priority = droppedLane.id === 'none' ? null : droppedLane.id as any;
       } else if (groupBy === 'status') {
         updates.status = droppedLane.id as any;
       } else if (groupBy === 'dependencies') {
         if (droppedLane.type === 'record') {
           const occupant = normalizedTasks.find(t => t.laneId === droppedLane.id && t.id !== task.id && !t.isMilestone);
           if (occupant) {
             updates.laneId = droppedLane.id;
             occupantUpdates = { id: occupant.id, updates: { laneId: task.laneId } };
           } else {
             updates.laneId = droppedLane.id;
           }
         }
         // If it's a group lane in manual mode, we do nothing and let it revert to its original laneId
       }
    }
    
    const oldLaneLayout = task.isMilestone
      ? laneLayouts.find(l => l.id === 'milestones-lane')
      : laneLayouts.find(l => l.id === (groupBy !== 'dependencies' ? task.dynamicLaneId : task.laneId));
      
    if (oldLaneLayout) {
      const rowHeight = 40;
      e.target.position({
        x: task.startOffset * pixelsPerDay,
        y: oldLaneLayout.y + (task.isMilestone ? 0 : (task.subLaneIndex || 0)) * rowHeight + (rowHeight - barHeight) / 2
      });
      const layer = e.target.getLayer();
      if (layer) layer.batchDraw();
    }
    if (occupantUpdates) {
       updateMultipleTasks([{ id: task.id, updates }, occupantUpdates]);
    } else if (Object.keys(updates).length > 0) {
       updateTask(task.id, updates);
    }
  }, [updateTask, updateMultipleTasks]);

  return {
    updateTask,
    updateLaneRecursively,
    deleteLaneRecursively,
    reorderLane,
    handleTaskDragEnd
  };
}

// Ensure rowHeight is defined for fallback
const rowHeight = 50;
