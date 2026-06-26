import { Group, Line, Text, Rect, Circle } from 'react-konva';
import { format, differenceInDays, addDays, addMonths } from 'date-fns';
import { TimelineLane, TimelineTask, ViewScale } from '../types';

interface TimelineGridProps {
  timelineWidth: number;
  h: number;
  headerHeight: number;
  baseDate: Date;
  pixelsPerDay: number;
  viewScale: ViewScale;
  laneLayouts: (TimelineLane & { y: number; height: number; subCount: number })[];
  normalizedTasks: TimelineTask[];
  todayX: number;
}

export function TimelineGrid({
  timelineWidth,
  h,
  headerHeight,
  baseDate,
  pixelsPerDay,
  viewScale,
  laneLayouts,
  normalizedTasks,
  todayX
}: TimelineGridProps) {
  
  const gridSegments = [];
  let currentSegmentDate = new Date(baseDate);
  let zebra = false;
  let segmentIndex = 0;

  while (true) {
    const xPos = differenceInDays(currentSegmentDate, baseDate) * pixelsPerDay;
    if (xPos >= timelineWidth) break; 

    let nextSegmentDate: Date;
    let label: string;
    
    if (viewScale === 'days') {
      nextSegmentDate = addDays(currentSegmentDate, 1);
      label = format(currentSegmentDate, 'EEE, MMM d');
    } else if (viewScale === 'months') {
      nextSegmentDate = addMonths(currentSegmentDate, 1);
      if (segmentIndex === 0 && currentSegmentDate.getDate() !== 1) {
         nextSegmentDate = new Date(currentSegmentDate.getFullYear(), currentSegmentDate.getMonth() + 1, 1);
      }
      label = format(currentSegmentDate, 'MMM yyyy');
    } else if (viewScale === 'quarters') {
      nextSegmentDate = addMonths(currentSegmentDate, 3);
      if (segmentIndex === 0 && currentSegmentDate.getDate() !== 1) {
         const currentQuarter = Math.floor(currentSegmentDate.getMonth() / 3);
         nextSegmentDate = new Date(currentSegmentDate.getFullYear(), (currentQuarter + 1) * 3, 1);
      }
      label = format(currentSegmentDate, "'Q'Q yyyy");
    } else if (viewScale === 'years') {
      nextSegmentDate = new Date(currentSegmentDate.getFullYear() + 1, 0, 1);
      label = format(currentSegmentDate, 'yyyy');
    } else {
      // weeks
      nextSegmentDate = addDays(currentSegmentDate, 7);
      label = format(currentSegmentDate, 'MMM d');
    }
    
    const segmentWidth = differenceInDays(nextSegmentDate, currentSegmentDate) * pixelsPerDay;
    const clampedWidth = Math.min(segmentWidth, timelineWidth - xPos);
    
    gridSegments.push({
      id: segmentIndex,
      xPos,
      width: clampedWidth,
      label,
      zebra
    });
    
    currentSegmentDate = nextSegmentDate;
    zebra = !zebra;
    segmentIndex++;
  }

  return (
    <Group>
      {/* Date Header and Zebra Columns */}
      {gridSegments.map(segment => (
        <Group key={`grid-${segment.id}`}>
          <Line
            points={[segment.xPos, 0, segment.xPos, h]}
            stroke="#f3f4f6"
            strokeWidth={1}
          />
          <Text
            x={segment.xPos + 8}
            y={20}
            text={segment.label}
            fontSize={12}
            fontFamily='"Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif'
            fill="#6b7280"
          />
          {segment.zebra && (
            <Rect
              x={segment.xPos}
              y={headerHeight}
              width={segment.width}
              height={h - headerHeight}
              fill="rgba(248, 250, 252, 0.8)"
            />
          )}
        </Group>
      ))}

      {/* Task Rows Horizontal Lines */}
      {laneLayouts.map((lane) => (
        <Line 
          key={`row-${lane.id}`}
          points={[0, lane.y + lane.height, timelineWidth, lane.y + lane.height]}
          stroke="#f3f4f6"
          strokeWidth={1}
        />
      ))}

      {/* Milestone Vertical Lines */}
      {normalizedTasks.filter(t => t.isMilestone).map((milestone) => {
        const xPos = milestone.startOffset * pixelsPerDay + pixelsPerDay / 2;
        if (xPos < 0 || xPos > timelineWidth) return null;
        return (
          <Line
            key={`milestone-line-${milestone.id}`}
            points={[xPos, headerHeight, xPos, h]}
            stroke="#3b82f6"
            strokeWidth={1}
            dash={[3, 3]}
            opacity={0.6}
            listening={false}
          />
        );
      })}

      {/* Today Indicator */}
      {todayX >= 0 && todayX <= timelineWidth && (
        <Group x={todayX} y={headerHeight - 20}>
          <Line points={[0, 0, 0, h - headerHeight + 20]} stroke="#ef4444" strokeWidth={1} dash={[4, 4]} />
          <Circle x={0} y={0} radius={4} fill="#ef4444" />
          <Text x={6} y={-6} text="Today" fontSize={11} fontFamily='"Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif' fill="#ef4444" fontStyle="bold" />
        </Group>
      )}
    </Group>
  );
}
