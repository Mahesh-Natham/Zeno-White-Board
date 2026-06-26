import { Arrow } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Trash2 } from 'lucide-react';
import { TimelineTask, TimelineLane, DependencyContext } from '../types';

interface TimelineDependenciesProps {
  normalizedTasks: TimelineTask[];
  laneLayouts: (TimelineLane & { y: number; height: number; subCount: number })[];
  pixelsPerDay: number;
  rowHeight: number;
  headerHeight: number;
  groupBy: string;
  selectedDep: DependencyContext | null;
  setSelectedDep: (dep: DependencyContext | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  updateTask: (taskId: string, updates: Partial<TimelineTask>) => void;
  connectingFromTaskId: string | null;
  mousePos: { x: number; y: number } | null;
  sidebarWidth: number;
  visibleLanes: TimelineLane[];
}

export function TimelineDependencies({
  normalizedTasks, laneLayouts, pixelsPerDay, rowHeight, headerHeight, groupBy,
  selectedDep, setSelectedDep, setSelectedTaskId, updateTask,
  connectingFromTaskId, mousePos, sidebarWidth, visibleLanes
}: TimelineDependenciesProps) {

  return (
    <>
      {/* Dynamic Connector Arrow */}
      {connectingFromTaskId && mousePos && (() => {
         const sourceTask = normalizedTasks.find(t => t.id === connectingFromTaskId);
         if (!sourceTask) return null;
         
         const sourceLaneLayout = sourceTask.isMilestone
            ? laneLayouts.find(l => l.id === 'milestones-lane')
            : laneLayouts.find(l => l.id === (groupBy !== 'dependencies' ? sourceTask.dynamicLaneId : sourceTask.laneId));
         if (!sourceLaneLayout) return null;
         
         const startX = sourceTask.isMilestone 
            ? (sourceTask.startOffset * pixelsPerDay + pixelsPerDay / 2 + 10) 
            : (sourceTask.startOffset + sourceTask.duration) * pixelsPerDay;
         const startY = sourceLaneLayout.y + (sourceTask.subLaneIndex || 0) * rowHeight + rowHeight / 2;
         const targetX = mousePos.x - sidebarWidth;
         const targetY = mousePos.y;
         
         const cp1X = startX + Math.max(30, Math.abs(targetX - startX) * 0.3);
         const cp1Y = startY;
         const cp2X = targetX - Math.max(30, Math.abs(targetX - startX) * 0.3);
         const cp2Y = targetY;
         
         return (
            <Arrow
              points={[startX, startY, cp1X, cp1Y, cp2X, cp2Y, targetX, targetY]}
              bezier={true}
              stroke="#3b82f6"
              strokeWidth={2}
              pointerLength={6}
              pointerWidth={6}
              dash={[4, 4]}
              listening={false}
            />
         );
      })()}

      {/* Dependency Lines */}
      {normalizedTasks.map((task) => {
        if (!task.dependencies || task.dependencies.length === 0) return null;
        return task.dependencies.map(depId => {
          const depTask = normalizedTasks.find(t => t.id === depId);
          if (!depTask) return null;
          
          const sourceLane = depTask.isMilestone
            ? laneLayouts.find(l => l.id === 'milestones-lane')
            : laneLayouts.find(l => l.id === (groupBy !== 'dependencies' ? depTask.dynamicLaneId : depTask.laneId));
          const targetLane = task.isMilestone
            ? laneLayouts.find(l => l.id === 'milestones-lane')
            : laneLayouts.find(l => l.id === (groupBy !== 'dependencies' ? task.dynamicLaneId : task.laneId));
          
          if (!sourceLane || !targetLane) return null;

          const startX = depTask.isMilestone
            ? (depTask.startOffset * pixelsPerDay + pixelsPerDay / 2 + 10)
            : (depTask.startOffset + depTask.duration) * pixelsPerDay;
          const startY = sourceLane.y + (depTask.subLaneIndex || 0) * rowHeight + rowHeight / 2;
          const endX = task.isMilestone
            ? (task.startOffset * pixelsPerDay + pixelsPerDay / 2 - 10)
            : task.startOffset * pixelsPerDay;
          const endY = targetLane.y + (task.subLaneIndex || 0) * rowHeight + rowHeight / 2;
          
          const cp1X = startX + Math.max(30, Math.abs(endX - startX) * 0.3);
          const cp1Y = startY;
          const cp2X = endX - Math.max(30, Math.abs(endX - startX) * 0.3);
          const cp2Y = endY;

          const isSelectedDep = selectedDep?.sourceId === depTask.id && selectedDep?.targetId === task.id;
          const targetX = task.isMilestone ? endX : endX - 5;
          return (
            <Arrow
              key={`dep-${task.id}-${depId}`}
              points={[
                startX, startY,
                cp1X, cp1Y,
                cp2X, cp2Y,
                targetX, endY
              ]}
              bezier={true}
              stroke={isSelectedDep ? '#ef4444' : '#9ca3af'}
              strokeWidth={isSelectedDep ? 2.5 : 1.5}
              pointerLength={6}
              pointerWidth={6}
              fill={isSelectedDep ? '#ef4444' : '#9ca3af'}
            />
          );
        });
      })}

      {/* Selected Dependency Trash Button Overlay */}
      {selectedDep && (() => {
         const sTask = normalizedTasks.find(t => t.id === selectedDep.sourceId);
         const tTask = normalizedTasks.find(t => t.id === selectedDep.targetId);
         if (!sTask || !tTask) return null;
         
          const sourceLane = sTask.isMilestone
            ? laneLayouts.find(l => l.id === 'milestones-lane')
            : laneLayouts.find(l => l.id === (groupBy !== 'dependencies' ? sTask.dynamicLaneId : sTask.laneId));
          const targetLane = tTask.isMilestone
            ? laneLayouts.find(l => l.id === 'milestones-lane')
            : laneLayouts.find(l => l.id === (groupBy !== 'dependencies' ? tTask.dynamicLaneId : tTask.laneId));
         if (!sourceLane || !targetLane) return null;

         const startX = sTask.isMilestone
            ? (sTask.startOffset * pixelsPerDay + pixelsPerDay / 2 + 10)
            : (sTask.startOffset + sTask.duration) * pixelsPerDay;
         const startY = sourceLane.y + (sTask.subLaneIndex || 0) * rowHeight + rowHeight / 2;
         const endX = tTask.isMilestone
            ? (tTask.startOffset * pixelsPerDay + pixelsPerDay / 2 - 10)
            : tTask.startOffset * pixelsPerDay;
         const endY = targetLane.y + (tTask.subLaneIndex || 0) * rowHeight + rowHeight / 2;
         
         const cp1X = startX + Math.max(30, Math.abs(endX - startX) * 0.3);
         const cp1Y = startY;
         const cp2X = endX - Math.max(30, Math.abs(endX - startX) * 0.3);
         const cp2Y = endY;

         // Cubic bezier midpoint
         const midX = 0.125 * startX + 0.375 * cp1X + 0.375 * cp2X + 0.125 * endX;
         const midY = 0.125 * startY + 0.375 * cp1Y + 0.375 * cp2Y + 0.125 * endY;
         
         return (
            <Html groupProps={{ x: midX, y: midY }} divProps={{ style: { position: 'absolute' } }}>
               <button 
                 className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
                 onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const deps = (tTask.dependencies || []).filter(id => id !== sTask.id);
                    updateTask(tTask.id, { dependencies: deps });
                    setSelectedDep(null);
                 }}
               >
                 <Trash2 size={12} />
               </button>
            </Html>
         );
      })()}
    </>
  );
}
