import { KanbanCard, KanbanColumn, KanbanData } from './types';

/**
 * Calculates contrast color (black or white) based on hex background
 */
export function getContrastColor(hex: string): string {
  if (!hex) return '#FFFFFF';
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
}

/**
 * Calculates a fractional position index between two adjacent items.
 * If either parameter is undefined, it generates a position at the edge.
 */
export function getPositionBetween(before?: number, after?: number): number {
  if (before === undefined && after === undefined) return 1000;
  if (before === undefined) return after! / 2;
  if (after === undefined) return before! + 1000;
  return (before + after) / 2;
}

/**
 * Checks if the gap between two positions is too small,
 * which indicates a need for rebalancing.
 */
export function needsRebalance(before: number, after: number): boolean {
  return Math.abs(after - before) < 0.001;
}

/**
 * Sorts an array of items by their position property in ascending order.
 */
export function sortByPosition<T extends { position: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.position - b.position);
}

/**
 * Gets all cards belonging to a specific column, sorted by position.
 */
export const getCardsInColumn = (cards: KanbanCard[], columnId: string): KanbanCard[] => {
  return sortByPosition(cards.filter(c => c.columnId === columnId));
};

export const getSwimlanes = (
  data: { cards: KanbanCard[], labels: { id: string, name: string, color: string }[], lanes?: { id: string, title: string, color?: string }[] },
  groupBy: 'none' | 'assignee' | 'priority' | 'label' | 'lane'
): { id: string, title: string, color?: string }[] => {
  if (groupBy === 'none') return [];

  if (groupBy === 'lane' && data.lanes) {
    return data.lanes;
  }

  if (groupBy === 'priority') {
    return [
      { id: 'critical', title: 'Critical', color: '#EF4444' },
      { id: 'high', title: 'High', color: '#F59E0B' },
      { id: 'medium', title: 'Medium', color: '#3B82F6' },
      { id: 'low', title: 'Low', color: '#10B981' },
      { id: 'none', title: 'No Priority', color: '#9CA3AF' },
    ];
  }

  if (groupBy === 'assignee') {
    const assignees = new Set<string>();
    data.cards.forEach(c => c.assigneeIds?.forEach(id => assignees.add(id)));
    
    const lanes = Array.from(assignees).map(id => {
      const user = MOCK_USERS.find(u => u.id === id);
      return { id, title: user?.name || id, color: user?.color };
    });
    
    return [...lanes, { id: 'unassigned', title: 'Unassigned', color: '#9CA3AF' }];
  }

  if (groupBy === 'label') {
    const labelIds = new Set<string>();
    data.cards.forEach(c => c.labelIds?.forEach(id => labelIds.add(id)));
    
    const lanes = Array.from(labelIds).map(id => {
      const label = data.labels.find(l => l.id === id);
      return { id, title: label?.name || id, color: label?.color };
    });
    
    return [...lanes, { id: 'unlabeled', title: 'No Labels', color: '#9CA3AF' }];
  }

  return [];
};

export const getCardsForSwimlaneAndColumn = (
  cards: KanbanCard[],
  columnId: string,
  swimlaneId: string,
  groupBy: string
): KanbanCard[] => {
  const colCards = cards.filter(c => c.columnId === columnId);
  
  if (groupBy === 'none') return sortByPosition(colCards);

  const filtered = colCards.filter(card => {
    if (groupBy === 'priority') return card.priority === swimlaneId;
    if (groupBy === 'assignee') {
      if (swimlaneId === 'unassigned') return !card.assigneeIds || card.assigneeIds.length === 0;
      return card.assigneeIds?.includes(swimlaneId);
    }
    if (groupBy === 'label') {
      if (swimlaneId === 'unlabeled') return !card.labelIds || card.labelIds.length === 0;
      return card.labelIds?.includes(swimlaneId);
    }
    if (groupBy === 'lane') {
      return card.laneId === swimlaneId;
    }
    return false;
  });

  return sortByPosition(filtered);
};

export const MOCK_USERS = [
  { id: 'user-1', name: 'Alice Smith', initials: 'AS', color: '#F87171' }, // Red
  { id: 'user-2', name: 'Bob Jones', initials: 'BJ', color: '#60A5FA' },   // Blue
  { id: 'user-3', name: 'Charlie Day', initials: 'CD', color: '#34D399' }, // Green
  { id: 'user-4', name: 'Diana Prince', initials: 'DP', color: '#A78BFA' }, // Purple
];

/**
 * Generates a vibrant accent color for columns based on their index.
 */
export const COLUMN_COLORS = [
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#10B981', // emerald
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#EF4444', // red
  '#06B6D4', // cyan
];

export function getColumnColor(index: number): string {
  return COLUMN_COLORS[index % COLUMN_COLORS.length];
}

/**
 * Utility to extract initials from a user's name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

/**
 * Calculates the total pixel width required to display the kanban board without horizontal scrolling.
 */
export function calculateKanbanWidth(
  columns: KanbanColumn[],
  settings: KanbanData['settings'],
  groupBy: string
): number {
  const columnWidth = settings?.columnWidth || 280;
  const gap = 16;
  const padding = 48; // p-6 is 24px each side
  
  let totalWidth = padding;
  
  columns.forEach(col => {
    totalWidth += (col.isCollapsed ? 56 : columnWidth) + gap;
  });
  
  if (groupBy === 'none') {
    // Space for the "Add Column" circular button
    totalWidth += 60;
  } else {
    // Remove the extra gap from the last column since there's no "Add Column" button
    if (columns.length > 0) {
      totalWidth -= gap;
    }
  }
  
  return totalWidth;
}

