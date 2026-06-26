export type ViewScale = 'days' | 'weeks' | 'months' | 'quarters' | 'years';
export type Priority = 'low' | 'medium' | 'high' | 'urgent' | null;
export type Status = 'not_started' | 'in_progress' | 'in_review' | 'done' | 'blocked';

export interface TimelineTask {
  id: string;
  title?: string;
  startOffset: number;
  duration: number;
  color?: string;
  laneId?: string;
  dynamicLaneId?: string;
  priority?: Priority;
  status?: Status;
  assignee?: string;
  estimate?: number;
  description?: string;
  comment?: string;
  dependencies?: string[];
  isMilestone?: boolean;
  rowIndex?: number;
  subLaneIndex?: number;
  
  // Kanban Interoperability
  labelIds?: string[];
  assigneeIds?: string[];
  checklists?: any[]; // Using any[] to avoid circular dependency for now, or we can import KanbanChecklist
}

export interface TimelineLane {
  id: string;
  title: string;
  type: 'group' | 'record' | 'milestones-track';
  isExpanded?: boolean;
  children?: TimelineLane[];
  level?: number;
  offsetValue?: number;
  nameValue?: string;
}

export interface TimelineElementData {
  id: string;
  type: 'timeline';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  locked?: boolean;
  title?: string;
  startDate?: string;
  endDate?: string;
  viewScale?: ViewScale;
  sidebarWidth?: number;
  tasks?: TimelineTask[];
  lanes?: TimelineLane[];
}

export interface DragContext {
  id: string;
  type: 'left' | 'right';
  deltaX: number;
}

export interface DependencyContext {
  sourceId: string;
  targetId: string;
}
