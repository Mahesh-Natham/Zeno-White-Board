// ─── BOARD-LEVEL (stored as element.kanbanData) ─────────
export interface KanbanData {
  title: string;
  background: string; // hex color or transparent
  labels: KanbanLabel[];
  settings: KanbanSettings;
  nextCardNumber: number;

  columns: KanbanColumn[];
  cards: KanbanCard[];
  
  // Timeline Interoperability
  lanes?: KanbanSwimlaneDef[];
}

export interface KanbanSettings {
  wipLimitsEnabled: boolean;
  cardNumbersEnabled: boolean;
  columnWidth: number; // 240-320px range
  autoSize?: boolean;
  fontFamily?: string;
  textColor?: string;
}

// ─── COLUMN ─────────────────────────────────────────────
export interface KanbanColumn {
  id: string;
  title: string;
  position: number; // fractional index
  color: string; // accent color hex
  wipLimit?: number;
  isDone: boolean;
  isCollapsed: boolean;
}

// ─── SWIMLANE ───────────────────────────────────────────
export interface KanbanSwimlaneDef {
  id: string;
  title: string;
  color?: string;
  type?: 'group' | 'record' | 'milestones-track';
  children?: KanbanSwimlaneDef[];
  isExpanded?: boolean;
}

// ─── CARD ───────────────────────────────────────────────
export interface KanbanCard {
  id: string;
  columnId: string;
  number: number; // #1, #2, #3...
  title: string;
  description: string; // markdown string
  position: number; // fractional index within column
  coverColor?: string;
  coverImageUrl?: string;

  assigneeIds: string[];
  labelIds: string[];
  priority: 'none' | 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  startDate?: string;
  estimationPoints?: number;

  checklists: KanbanChecklist[];
  commentCount: number;
  comment?: string;
  attachmentCount: number;

  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Timeline Interoperability
  laneId?: string;
  isMilestone?: boolean;
  dependencies?: string[];
}

// ─── LABEL ──────────────────────────────────────────────
export interface KanbanLabel {
  id: string;
  name: string;
  color: string;
}

// ─── CHECKLIST ──────────────────────────────────────────
export interface KanbanChecklist {
  id: string;
  title: string;
  items: KanbanChecklistItem[];
  position: number;
}

export interface KanbanChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  position: number;
}

// ─── UTILS ──────────────────────────────────────────────
export type MoveCardParams = {
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  newPosition: number;
};

export type MoveColumnParams = {
  columnId: string;
  newPosition: number;
};
