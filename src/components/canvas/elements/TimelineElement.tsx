import { useRef, useEffect, useState } from 'react';
import { Group, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import { addDays, differenceInDays } from 'date-fns';
import { TimelineElementData, TimelineTask, TimelineLane, ViewScale } from './timeline/types';
import { useTimelineState } from './timeline/hooks/useTimelineState';
import { useTimelineLayout } from './timeline/hooks/useTimelineLayout';
import { useTimelineInteractions } from './timeline/hooks/useTimelineInteractions';
import { TimelineHeader } from './timeline/components/TimelineHeader';
import { TimelineSidebar } from './timeline/components/TimelineSidebar';
import { TimelineGrid } from './timeline/components/TimelineGrid';
import { TimelineDependencies } from './timeline/components/TimelineDependencies';
import { TimelineTaskBar } from './timeline/components/TimelineTaskBar';
import { TimelineTaskSidebar } from './timeline/components/TimelineTaskSidebar';

interface TimelineElementProps {
  element: TimelineElementData;
  isSelected: boolean;
  onChange?: (id: string, updates: Partial<TimelineElementData>) => void;
  onSelect?: (e: any, id: string) => void;
}

const DEFAULT_LANES: TimelineLane[] = [
  {
    id: 'group-1',
    title: 'Development Phase',
    type: 'group',
    isExpanded: true,
    children: [
      { id: 'lane-0', title: 'Frontend Team', type: 'record' },
      { id: 'lane-1', title: 'Backend Team', type: 'record' },
    ]
  },
  {
    id: 'group-2',
    title: 'Marketing Phase',
    type: 'group',
    isExpanded: true,
    children: [
      { id: 'lane-2', title: 'Design', type: 'record' },
    ]
  }
];

const DEFAULT_TASKS: TimelineTask[] = [
  { id: 'task-1', title: 'UI Mockups', startOffset: 0, duration: 3, color: '#3b82f6', laneId: 'lane-2', status: 'done', priority: 'medium', isMilestone: false },
  { id: 'task-2', title: 'Setup React App', startOffset: 4, duration: 2, color: '#10b981', laneId: 'lane-0', dependencies: ['task-1'], status: 'in_progress', priority: 'high' },
  { id: 'task-3', title: 'API Design', startOffset: 1, duration: 4, color: '#8b5cf6', laneId: 'lane-1', status: 'done', priority: 'urgent' },
  { id: 'task-4', title: 'Beta Launch', startOffset: 10, duration: 1, color: '#ef4444', laneId: 'lane-1', isMilestone: true, dependencies: ['task-2'] }
];

export function TimelineElement({ element, isSelected, onChange}: TimelineElementProps) {
  const lanes = element.lanes || DEFAULT_LANES;
  const tasks = element.tasks || DEFAULT_TASKS;
  const title = element.title || 'Project Timeline';
  const baseDateStr = element.startDate || new Date().toISOString();
  const endDateStr = element.endDate;
  const viewScale = element.viewScale || 'weeks';
  const sidebarWidth = element.sidebarWidth || 200;
  
  const baseDate = new Date(baseDateStr);
  const maxEndOffset = tasks.reduce((max, t) => Math.max(max, t.startOffset + t.duration + 5), 14);
  const calculatedEndDate = endDateStr ? new Date(endDateStr) : addDays(baseDate, maxEndOffset);
  const totalDays = Math.max(7, differenceInDays(calculatedEndDate, baseDate));

  const pixelsPerDay = viewScale === 'days' ? 60 : viewScale === 'weeks' ? 20 : viewScale === 'months' ? 5 : viewScale === 'quarters' ? 2 : 1;
  const timelineWidth = Math.max(800, totalDays * pixelsPerDay);
  
  const headerHeight = 60;
  const rowHeight = 44;
  const barHeight = 28;

  // Custom Hooks
  const { state, setters, clearSelections } = useTimelineState();
  
  const {
    selectedTaskId, hoveredTaskId, editingTaskId, connectingFromTaskId, mousePos, selectedDep,
    openTaskDetailsId,
    searchQuery, activeFilter, sortMode, groupBy
  } = state;

  const {
    setMousePos,
    setLeftMonth, setRightMonth
  } = setters;

  const {
    visibleLanes, laneLayouts, normalizedTasks, requiredHeight
  } = useTimelineLayout({
    tasks, lanes, groupBy, sortMode, baseDate, searchQuery, activeFilter, headerHeight, rowHeight
  });

  const {
    updateTask, updateLaneRecursively, deleteLaneRecursively, reorderLane, handleTaskDragEnd
  } = useTimelineInteractions({ elementId: element.id, tasks, lanes, onChange });

  const h = Math.max(element.height || 400, requiredHeight + headerHeight);

  // Auto-update width/height if needed
  useEffect(() => {
    if (onChange) {
      let updates: any = {};
      if (element.width !== timelineWidth + sidebarWidth) updates.width = timelineWidth + sidebarWidth;
      if (element.height !== h) updates.height = h;
      if (Object.keys(updates).length > 0) onChange(element.id, updates);
    }
  }, [timelineWidth, h, element.width, element.height, sidebarWidth, onChange, element.id]);

  // Click outside to clear selections
  useEffect(() => {
    const handleGlobalClick = () => clearSelections();
    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, [clearSelections]);

  const addMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const groupMenuRef = useRef<HTMLDivElement>(null);
  const taskToolbarRef = useRef<HTMLDivElement>(null);
  const priorityMenuRef = useRef<HTMLDivElement>(null);
  const leftMonthPickerRef = useRef<HTMLDivElement>(null);
  const rightMonthPickerRef = useRef<HTMLDivElement>(null);
  const laneMenuRef = useRef<HTMLDivElement>(null);

  // Today marker
  const today = new Date();
  const todayOffset = differenceInDays(today, baseDate);
  const todayX = todayOffset * pixelsPerDay + pixelsPerDay / 2;

  const handleScaleChange = (scale: ViewScale) => {
    if (onChange) onChange(element.id, { viewScale: scale });
  };

  return (
    <>
      <Group
        id={element.id}
        x={element.x}
        y={element.y}
        rotation={element.rotation || 0}
        scaleX={element.scaleX || 1}
        scaleY={element.scaleY || 1}
        onMouseMove={(e: any) => {
          if (connectingFromTaskId) {
            const stage = e.target.getStage();
            const pointer = stage.getPointerPosition();
            if (pointer && e.currentTarget) {
              const transform = e.currentTarget.getAbsoluteTransform().copy();
              transform.invert();
              const localPos = transform.point(pointer);
              setMousePos({ x: localPos.x, y: localPos.y });
            }
          }
        }}
      >
        {/* Main Background */}
        <Rect name="board-element" width={element.width || 800} height={h} fill="#ffffff" cornerRadius={8} shadowColor="rgba(0,0,0,0.1)" shadowBlur={15} shadowOffset={{ x: 0, y: 4 }} />

        {/* --- Header --- */}
        <TimelineHeader
          elementId={element.id} title={title} lanes={lanes} tasks={tasks} onChange={onChange}
          state={state} setters={setters}
          addMenuRef={addMenuRef} filterMenuRef={filterMenuRef} sortMenuRef={sortMenuRef} groupMenuRef={groupMenuRef}
          elementLocked={!!element.locked}
        />

        {/* --- Sidebar --- */}
        <TimelineSidebar
          elementId={element.id} title={title} sidebarWidth={sidebarWidth} headerHeight={headerHeight}
          laneLayouts={laneLayouts} lanes={lanes} tasks={tasks} onChange={onChange}
          state={state} setters={setters} handleScaleChange={handleScaleChange} groupBy={groupBy}
          clearSelections={clearSelections} baseDate={baseDate} calculatedEndDate={calculatedEndDate}
          pixelsPerDay={pixelsPerDay}
          leftMonthPickerRef={leftMonthPickerRef} rightMonthPickerRef={rightMonthPickerRef} laneMenuRef={laneMenuRef}
          updateLaneRecursively={updateLaneRecursively} deleteLaneRecursively={deleteLaneRecursively}
          elementLocked={!!element.locked}
        />

        {/* --- Main Timeline Area --- */}
        <Group x={sidebarWidth} y={0}>
          <TimelineGrid
            timelineWidth={timelineWidth} h={h} headerHeight={headerHeight} baseDate={baseDate}
            pixelsPerDay={pixelsPerDay} viewScale={viewScale} laneLayouts={laneLayouts}
            normalizedTasks={normalizedTasks} todayX={todayX}
          />

          <TimelineDependencies
            normalizedTasks={normalizedTasks} laneLayouts={laneLayouts} pixelsPerDay={pixelsPerDay}
            rowHeight={rowHeight} headerHeight={headerHeight} groupBy={groupBy}
            selectedDep={selectedDep} setSelectedDep={setters.setSelectedDep} setSelectedTaskId={setters.setSelectedTaskId}
            updateTask={updateTask} connectingFromTaskId={connectingFromTaskId} mousePos={mousePos}
            sidebarWidth={sidebarWidth} visibleLanes={visibleLanes}
          />

          {normalizedTasks.map(task => {
            const laneLayout = task.isMilestone
              ? laneLayouts.find(l => l.id === 'milestones-lane')
              : laneLayouts.find(l => l.id === (groupBy !== 'dependencies' ? task.dynamicLaneId : task.laneId));

            if (!laneLayout) return null;

            return (
              <TimelineTaskBar
                key={task.id} task={task} taskLane={laneLayout} pixelsPerDay={pixelsPerDay}
                rowHeight={rowHeight} barHeight={barHeight} baseDate={baseDate}
                elementLocked={!!element.locked} state={state} setters={setters}
                updateTask={updateTask} 
                handleTaskDragEnd={(e: any, t: any) => handleTaskDragEnd(e, t, pixelsPerDay, laneLayouts, headerHeight, barHeight, groupBy, normalizedTasks)}
                visibleLanes={visibleLanes} groupBy={groupBy} lanes={lanes}
                reorderLane={reorderLane} onChange={onChange} elementId={element.id}
                taskToolbarRef={taskToolbarRef} priorityMenuRef={priorityMenuRef}
                normalizedTasks={normalizedTasks}
              />
            );
          })}
        </Group>

        {isSelected && (
          <Rect x={0} y={0} width={element.width || 800} height={h} stroke="#3b82f6" strokeWidth={2} cornerRadius={8} listening={false} />
        )}
      </Group>

      {/* --- Task Sidebar --- */}
      {openTaskDetailsId && (
        <Html>
          <TimelineTaskSidebar
            task={normalizedTasks.find(t => t.id === openTaskDetailsId)}
            updateTask={updateTask}
            onClose={() => setters.setOpenTaskDetailsId(null)}
            baseDate={baseDate}
          />
        </Html>
      )}
    </>
  );
}
