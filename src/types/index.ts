export type Role = 'owner' | 'editor' | 'viewer';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
  collaborators?: Record<string, Role>;
  thumbnail?: string;
  projectId?: string | null;
  workspaceId?: string;
  isDeleted?: boolean;
  isStarred?: boolean;
}

export type ElementType = 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'sticky_note' | 'image' | 'pencil' | 'google_workspace' | 'doc' | 'timeline' | 'kanban' | 'table';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  zIndex?: number;
  isLocked?: boolean;
  groupId?: string | null;
  [key: string]: any;
}

export interface ShapeElement extends BaseElement {
  type: 'rectangle' | 'circle';
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  align?: 'left' | 'center' | 'right';
  width: number;
}

export interface StickyNoteElement extends BaseElement {
  type: 'sticky_note';
  text: string;
  color: string;
  width: number;
  height: number;
}

export interface LineElement extends BaseElement {
  type: 'line' | 'arrow' | 'pencil';
  points: number[];
  stroke: string;
  strokeWidth: number;
  tension?: number;
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'round' | 'bevel' | 'miter';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  width: number;
  height: number;
}

export interface GoogleWorkspaceElement extends BaseElement {
  type: 'google_workspace';
  url: string;
  width: number;
  height: number;
}

export interface DocElement extends BaseElement {
  type: 'doc';
  content: string;
  width: number;
  height: number;
}

export type CanvasElement = ShapeElement | TextElement | StickyNoteElement | LineElement | ImageElement | GoogleWorkspaceElement | DocElement;

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  workspaceId: string;
  ownerId: string;
  boardId?: string | null;
  projectId?: string | null;
  createdAt: any;
}
