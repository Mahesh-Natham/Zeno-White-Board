export type ColumnType = 'text' | 'status' | 'date' | 'assignee' | 'number' | 'checkbox';

export interface Column {
  id: string;
  label: string;
  type: ColumnType;
  width: number;
  options?: string[]; // For status/select types
  visible: boolean;
}

export interface CellData {
  value: any;
}

export interface Row {
  id: string;
  cells: Record<string, CellData>; // key is column.id
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortRule {
  columnId: string;
  direction: SortDirection;
}

export interface FilterRule {
  columnId: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value: any;
}
